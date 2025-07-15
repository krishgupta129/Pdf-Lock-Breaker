# PDF Unlocker App

A simple Flask web app to brute-force unlock password-protected PDFs using numeric passwords.

---

## Features

- Upload locked PDF and specify numeric password length (digits)
- Pause, Resume, and Stop the brute force process
- Real-time progress and current password attempt display
- Download the unlocked PDF once password is found
- Clean modern frontend with progress bar and controls

---

## Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/yourusername/pdf-unlocker-app.git
   cd pdf-unlocker-app
   
2. Install dependencies
   pip install -r requirements.txt

## Usage
Run the Flask app:
   python app.py
Open your browser at http://127.0.0.1:5000

Upload your locked PDF, set the number of digits, and start the brute force. Use Pause/Resume/Stop as needed. Download the unlocked PDF when available.

## Dependencies
1. Flask
2. pikepdf
3. tqdm

## Note: I have also provided you the example locked pdf for testing, password for that file is '12345'

⚠️ Disclaimer: This tool is intended for educational and personal use only. Use it only on PDF files that you own or have explicit permission to unlock. The developer is not responsible for any misuse or illegal activity performed using this application.
