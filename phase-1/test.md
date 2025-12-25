```powershell
# Task Add 
python -m src.cli.main add "Grocery Shopping" "Milk, Bread, Eggs, Cheese, Butter"
python -m src.cli.main add "Study Python" "Complete chapter 5 and do exercises"
python -m src.cli.main add "Exercise" "Go for morning run at 6 AM"
python -m src.cli.main add "Call Mom" "Wish her happy birthday"
python -m src.cli.main add "Project Work" "Finish todo app and write documentation"

# List all tasks
python -m src.cli.main list

# Task Complete
python -m src.cli.main complete 1
python -m src.cli.main complete 2

# Task Incomplete
python -m src.cli.main incomplete 1

# Task Update 
python -m src.cli.main update 1 "Grocery Shopping Updated" "Milk, Bread, Eggs, Cheese, Butter, Jam"
python -m src.cli.main update 2 "Study Python Advanced" "Complete chapter 5, 6 and do all exercises"

# Task Delete
python -m src.cli.main delete 1
```

### Real World Examples 

```powershell
# Example 1: Shopping List
python -m src.cli.main add "Weekly Grocery" "Milk, Eggs, Bread, Rice, Chicken, Vegetables"
python -m src.cli.main list
python -m src.cli.main complete 1

# Example 2: Study Tasks
python -m src.cli.main add "Python Learning" "Complete OOP concepts and practice coding"
python -m src.cli.main add "Math Homework" "Solve algebra problems chapter 3"
python -m src.cli.main list
python -m src.cli.main update 1 "Python Learning" "Complete OOP, Decorators, and Generators"
python -m src.cli.main complete 1

# Example 3: Work Tasks
python -m src.cli.main add "Project Deadline" "Finish frontend design and backend API"
python -m src.cli.main add "Team Meeting" "Prepare presentation for client meeting"
python -m src.cli.main list
python -m src.cli.main complete 2
python -m src.cli.main update 1 "Project Deadline" "Finish frontend, backend API, and write tests"
```

---

**Happy Coding! 🎉**

