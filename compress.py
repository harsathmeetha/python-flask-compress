from flask import Flask, request, jsonify, make_response, send_file
from PIL import Image
import os
from io import BytesIO

app = Flask(__name__)


@app.route('/compress', methods=['POST'])
def compressFile():
    if 'file' not in request.files:
        resp = jsonify({'message': 'No file part in the request'})
        resp.status_code = 400
        return resp

    file = request.files['file']
    print('file ', file)

    if file.filename == '':
        resp = jsonify({'message': 'No file selected for uploading'})
        resp.status_code = 400
        return resp

    outputImage = BytesIO()
    inputImage = Image.open(file)
    inputImage.save(outputImage, "JPEG", optimize=True, quality=50)

    # response = make_response()
    # response.data = codecs.open(FILE_DIR + "\\" + outputFilename, 'rb').read()
    # return response

    outputImage.seek(0)
    return send_file(outputImage, as_attachment=True)


if __name__ == "__main__":
    app.run()
