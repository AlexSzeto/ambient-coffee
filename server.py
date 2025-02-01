from flask import Flask, render_template
import webbrowser
import threading

app = Flask(__name__, static_url_path='/', static_folder='.')

@app.route('/')
def index():
    return render_template("index.html")

def open_browser():
    """Opens the default web browser to the Flask server."""
    webbrowser.open_new("http://127.0.0.1:5000/")

# Run the app
if __name__ == "__main__":
    # Run the browser in a separate thread to prevent blocking
    threading.Thread(target=open_browser).start()
    app.run(debug=True)
