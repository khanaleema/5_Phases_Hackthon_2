/**
 * Get JWT token from Better Auth
 * Better Auth JWT plugin stores JWT token in the session
 * This function fetches the session and extracts JWT token
 */
let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;
let lastFetchTime = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getJWTToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Return cached token if available and not expired
  const now = Date.now();
  if (cachedToken && !forceRefresh && (now - lastFetchTime) < TOKEN_CACHE_DURATION) {
    return cachedToken;
  }

  // If already fetching, return the same promise
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  // Fetch token
  tokenFetchPromise = (async () => {
    try {
      // First, try to get JWT from cookies (Better Auth JWT plugin may store it there)
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          const decodedValue = decodeURIComponent(value);
          // Check for JWT-like cookies (starts with eyJ)
          if (decodedValue && decodedValue.startsWith('eyJ')) {
            console.log('✅ JWT token found in cookie:', name);
            cachedToken = decodedValue;
            lastFetchTime = now;
            tokenFetchPromise = null;
            return decodedValue;
          }
        }
      }

      // Priority 1: Try custom JWT token endpoint (most reliable)
      try {
        const jwtResponse = await fetch('/api/auth/jwt-token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (jwtResponse.ok) {
          const jwtData = await jwtResponse.json();
          if (jwtData?.token && typeof jwtData.token === 'string' && jwtData.token.startsWith('eyJ')) {
            console.log('✅ JWT token retrieved from /api/auth/jwt-token');
            cachedToken = jwtData.token;
            lastFetchTime = now;
            tokenFetchPromise = null;
            return jwtData.token;
          } else {
            console.debug('JWT token endpoint returned invalid token format');
          }
        } else if (jwtResponse.status === 401) {
          // Not authenticated - this is expected, not an error
          console.debug('Not authenticated - 401 from jwt-token endpoint');
          tokenFetchPromise = null;
          cachedToken = null;
          return null;
        } else {
          // Other error status - log but don't throw
          console.warn(`JWT token endpoint returned ${jwtResponse.status}`);
        }
      } catch (e) {
        // Network error or other fetch error - log but continue to next method
        console.debug('JWT token endpoint fetch error (will try other methods):', e);
      }

      // Priority 2: Try Better Auth's get-session endpoint (if it exists)
      try {
        const response = await fetch('/api/auth/get-session', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('get-session response:', data);
          
          // Check for token in response
          const possiblePaths = [
            data?.token,
            data?.jwt,
            data?.session?.token,
            data?.session?.jwt,
            data?.data?.token,
            data?.data?.jwt,
          ];
          
          for (const token of possiblePaths) {
            if (token && typeof token === 'string' && token.startsWith('eyJ')) {
              console.log('✅ JWT token found in get-session response');
              cachedToken = token;
              lastFetchTime = now;
              tokenFetchPromise = null;
              return token;
            }
          }
        }
      } catch (e) {
        // get-session endpoint might not exist, that's okay
        console.debug('get-session endpoint not available');
      }

      // Token not found - this is expected if user is not authenticated
      // Don't log as error, just return null silently
      console.debug('JWT token not found - user may not be authenticated');
      tokenFetchPromise = null;
      cachedToken = null;
      return null;
    } catch (error) {
      // Only log actual errors, not expected null returns
      console.warn('Error while fetching JWT token:', error);
      tokenFetchPromise = null;
      cachedToken = null;
      return null;
    }
  })();

  return tokenFetchPromise;
}

/**
 * Clear cached token (call on sign out)
 */
export function clearJWTToken(): void {
  cachedToken = null;
  tokenFetchPromise = null;
  lastFetchTime = 0;
}

