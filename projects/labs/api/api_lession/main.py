from flask import Flask, jsonify, request
import random
from dotenv import load_dotenv
import datetime
import os
import json
import requests

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello, World!"

@app.route("/random-number")
def random_number():
    response = {
        "random_number": random.randint(1, 100)
    }
    return jsonify(response)

@app.route("/random-name")
def random_name():
    response = {
        "random_name": random.choice(["Oskar", "Chris", "Ossian", "Viktor", "Max"])
    }
    return jsonify(response)

@app.route("/current-time")
def time():
    response = {
        "time": datetime.datetime.now().strftime("%H:%M:%S")
    }
    return jsonify(response)

@app.route("/current-date")
def current_date():
    response = {
        "current_date": datetime.datetime.now().strftime("%Y-%m-%d")
    }
    return jsonify(response)

@app.route("/convert-currency", methods=["GET", "POST"])
def converter():
    start = request.args.get("from")
    end = request.args.get("to")
    amount = request.args.get("amount")
    
    if start == "SEK" and end == "USD":
        amount = float(amount) * 0.09
        
    elif start == "USD" and end == "SEK":
        amount = float(amount) * 11.05
        
    
    return jsonify(amount)

@app.route("/weather")
def weather():
    api_key = os.getenv("API_KEY")
    city = request.args.get("city")
    url = f"https://api.weatherbit.io/v2.0/current?city={city}&key={api_key}&include=minutely"
    response = requests.get(url).json()
    to_send = f'city: {response["data"][0]["city_name"]} temperature: {response["data"][0]["temp"]}°C'
    
    return to_send

@app.route("/jokes")
def jokes():
    jokes = ["What do you call a very small valentine? A valen-tiny!", "What did the dog say when he rubbed his tail on the sandpaper? Rough, rough!", "Why don't sharks like to eat clowns? Because they taste funny!"]
    return jsonify(random.choice(jokes))

@app.route("/word-counter", methods=["GET", "POST"])
def word_counter():
    text = request.args.get("text")
    words = text.split(" ")
    return jsonify(len(words))

@app.route("/is-palindrome", methods=["GET", "POST"])
def is_palindrome():
    text = request.args.get("text")
    if text == text[::-1]:
        return jsonify(True)
    else:
        return jsonify(False)

@app.route("/countries")
def countries():
    with open("data/countries.json") as file:
        countries = json.load(file)
        return jsonify(countries)
    
@app.route("/daily-horoscope")
def horoscope():
    sign = request.args.get("sign")
    with open("data/horoscope.json") as file:
        horoscope = json.load(file)
        return jsonify(horoscope[sign])

if __name__ == "__main__":
    load_dotenv()
    app.run(debug=True)
