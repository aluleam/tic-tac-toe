import tkinter as tk
import math
import random

# Initialize the board
board = [' ' for _ in range(9)]
difficulty = 'Difficult'  # Default difficulty level

def is_winner(board, player):
    win_conditions = [
        [board[0], board[1], board[2]],
        [board[3], board[4], board[5]],
        [board[6], board[7], board[8]],
        [board[0], board[3], board[6]],
        [board[1], board[4], board[7]],
        [board[2], board[5], board[8]],
        [board[0], board[4], board[8]],
        [board[2], board[4], board[6]]
    ]
    return [player, player, player] in win_conditions

def is_board_full(board):
    return ' ' not in board

def get_available_moves(board):
    return [i for i, x in enumerate(board) if x == ' ']

def make_move(board, position, player):
    board[position] = player

def minimax(board, depth, is_maximizing, max_depth):
    if is_winner(board, 'O'):
        return 1
    elif is_winner(board, 'X'):
        return -1
    elif is_board_full(board):
        return 0

    if depth >= max_depth:
        return 0

    if is_maximizing:
        best_score = -math.inf
        for move in get_available_moves(board):
            make_move(board, move, 'O')
            score = minimax(board, depth + 1, False, max_depth)
            make_move(board, move, ' ')
            best_score = max(score, best_score)
        return best_score
    else:
        best_score = math.inf
        for move in get_available_moves(board):
            make_move(board, move, 'X')
            score = minimax(board, depth + 1, True, max_depth)
            make_move(board, move, ' ')
            best_score = min(score, best_score)
        return best_score

def best_move(board):
    if difficulty == 'Easy':
        return random.choice(get_available_moves(board))
    elif difficulty == 'Moderate':
        max_depth = 2
    else:  # Difficult
        max_depth = 9

    best_score = -math.inf
    move = 0
    for i in get_available_moves(board):
        make_move(board, i, 'O')
        score = minimax(board, 0, False, max_depth)
        make_move(board, i, ' ')
        if score > best_score:
            best_score = score
            move = i
    return move

def on_button_click(index):
    global board, buttons
    if board[index] == ' ':
        make_move(board, index, 'X')
        buttons[index].config(text='X')
        if is_winner(board, 'X'):
            status_label.config(text="You win!")
            disable_buttons()
            return
        elif is_board_full(board):
            status_label.config(text="It's a draw!")
            disable_buttons()
            return

        # AI Move
        ai_move = best_move(board)
        make_move(board, ai_move, 'O')
        buttons[ai_move].config(text='O')

        if is_winner(board, 'O'):
            status_label.config(text="AI wins!")
            disable_buttons()
        elif is_board_full(board):
            status_label.config(text="It's a draw!")
            disable_buttons()

def disable_buttons():
    global buttons
    for button in buttons:
        button.config(state=tk.DISABLED)

def reset_game():
    global board, buttons
    board = [' ' for _ in range(9)]
    for button in buttons:
        button.config(text='', state=tk.NORMAL)
    status_label.config(text="Your turn!")

def set_difficulty(level):
    global difficulty
    difficulty = level
    reset_game()

# Create the main window
root = tk.Tk()
root.title("Tic-Tac-Toe")

# Create the buttons for the Tic-Tac-Toe grid
buttons = []
for i in range(9):
    button = tk.Button(root, text='', font=('normal', 20), width=5, height=2,
                       command=lambda i=i: on_button_click(i))
    button.grid(row=i//3, column=i%3)
    buttons.append(button)

# Create a label to display the game status
status_label = tk.Label(root, text="Your turn!", font=('normal', 15))
status_label.grid(row=3, column=0, columnspan=3)

# Create a reset button
reset_button = tk.Button(root, text="Reset", font=('normal', 15), command=reset_game)
reset_button.grid(row=4, column=0, columnspan=3)

# Create difficulty level buttons
difficulty_frame = tk.Frame(root)
difficulty_frame.grid(row=5, column=0, columnspan=3)

easy_button = tk.Button(difficulty_frame, text="Easy", font=('normal', 12), command=lambda: set_difficulty('Easy'))
easy_button.grid(row=0, column=0)

moderate_button = tk.Button(difficulty_frame, text="Moderate", font=('normal', 12), command=lambda: set_difficulty('Moderate'))
moderate_button.grid(row=0, column=1)

difficult_button = tk.Button(difficulty_frame, text="Difficult", font=('normal', 12), command=lambda: set_difficulty('Difficult'))
difficult_button.grid(row=0, column=2)

# Start the main event loop
root.mainloop()
