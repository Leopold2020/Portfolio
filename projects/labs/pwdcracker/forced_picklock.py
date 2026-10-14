# oskar Svedlund
# TE4
# 2023-08-23
# password cracker

import string
import itertools
import time
char = string.printable
def brutesolve(password):
    guess = ""
    tries = 0
    lenght = 0
    start_time = time.time()
    while guess != password:
        lenght += 1
        for item in itertools.product(char, repeat=lenght):
            tries += 1
            guess = "".join(item)
            if guess == password:
                print("your password is", guess, "tries", tries)
                break
    end_time = time.time()
    print("took", end_time - start_time, "seconds")

password = input(">> ")
brutesolve(password)