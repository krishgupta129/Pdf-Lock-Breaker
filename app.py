from flask import Flask, request, Response, render_template, send_file
import tempfile
import pikepdf
from pikepdf import PasswordError
import time

app = Flask(__name__)

paused = False
stopped = False
current_status = {
    'done': 0,
    'total': 0,
    'current': '',
    'found': False,
    'password': '',
    'output_path': ''
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/brute-force', methods=['POST'])
def brute_force():
    global paused, stopped, current_status
    pdf = request.files['pdf']
    digits = int(request.form['digits'])

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        pdf.save(temp.name)
        input_path = temp.name
        output_path = input_path.replace('.pdf', '_unlocked.pdf')
        current_status['output_path'] = output_path

    # Total number of attempts: from 0 to (10**digits - 1)
    max_range = 10 ** digits
    current_status['total'] = max_range
    current_status['done'] = 0
    current_status['found'] = False
    current_status['password'] = ''
    paused = False
    stopped = False

    def generate():
        for i in range(max_range):
            if stopped:
                break

            while paused:
                time.sleep(0.1)

            password = str(i)  # No zfill — try the raw number
            current_status['done'] = i
            current_status['current'] = password

            yield f"progress:{i}/{max_range}|current:{password}|status:testing\n"

            try:
                with pikepdf.open(input_path, password=password) as pdf_file:
                    pdf_file.save(output_path)
                    current_status['found'] = True
                    current_status['password'] = password
                    yield f"progress:{i}/{max_range}|current:{password}|status:found:{password}\n"
                    return
            except PasswordError:
                continue
            except Exception as e:
                yield f"status:error:{str(e)}\n"
                return

        if not current_status['found']:
            yield f"status:done:Password not found\n"

    return Response(generate(), mimetype='text/plain')


@app.route('/pause', methods=['POST'])
def pause():
    global paused
    paused = True
    return 'Paused'


@app.route('/resume', methods=['POST'])
def resume():
    global paused
    paused = False
    return 'Resumed'


@app.route('/stop', methods=['POST'])
def stop():
    global stopped, paused, current_status
    stopped = True
    paused = False
    current_status = {
        'done': 0,
        'total': 0,
        'current': '',
        'found': False,
        'password': '',
        'output_path': ''
    }
    return 'Stopped'


@app.route('/download')
def download():
    if current_status['found'] and current_status['output_path']:
        try:
            return send_file(current_status['output_path'], as_attachment=True)
        except Exception:
            return "File not found", 404
    return "No file available", 404

if __name__ == '__main__':
    app.run(debug=True)
