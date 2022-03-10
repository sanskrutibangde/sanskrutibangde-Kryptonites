import os
from uuid import uuid4
import tensorflow 
import math 
from flask import Flask, request, render_template, send_from_directory

app = Flask(__name__)
# app = Flask(__name__, static_folder="images")



APP_ROOT = os.path.dirname(os.path.abspath(__file__))

classes = ['Normal','COVID','Lung_Opacity','Viral Pneumonia']
classes1 = ['COVID','NON-COVID']

@app.route("/")
def index():
    return render_template("index.html")
@app.route("/covid")
def covid():
    return render_template("covid.html")

@app.route("/mucormycosis")
def mucormycosis():
    return render_template("mucormycosis.html")
@app.route("/vaccine")
def vaccine():
    return render_template("vaccine.html")


@app.route("/upload", methods=["POST"])
def upload():
    target = os.path.join(APP_ROOT, 'images/')
    # target = os.path.join(APP_ROOT, 'static/')
    print(target)
    if not os.path.isdir(target):
            os.mkdir(target)
    else:
        print("Couldn't create upload directory: {}".format(target))
    print(request.files.getlist("file"))
    for upload in request.files.getlist("file"):
        print(upload)
        print("{} is the file name".format(upload.filename))
        filename = upload.filename
        destination = "/".join([target, filename])
        print ("Accept incoming file:", filename)
        print ("Save it to:", destination)
        upload.save(destination)
        #import tensorflow as tf
        import numpy as np
        from tensorflow.keras.preprocessing import image

        #from tensorflow.keras.models import load_model
        new_model = tensorflow.keras.models.load_model('C:/Users/sansk/Downloads/archive (2)/COVID-19_Radiography_Dataset')
        new_model.summary()
        test_image = image.load_img('images\\'+filename,target_size=(150,150,3))
        test_image = image.img_to_array(test_image)
        test_image = np.expand_dims(test_image, axis = 0)
        result = new_model.predict(test_image)
        result1 = result[0]
        for i in range(4):
            print (result1[i]) 
            if result1[i] == 1.:
                break;
        prediction = classes[i] 
        if(prediction=="NORMAL"):
            prediction="Your results COVID-19 Detection result are NEGATIVE "
        if(prediction=="Lung_Opacity"):
            prediction="Your results COVID-19 Detection result are NEGATIVE.You Probably have Lung Opacity."
        if(prediction=="Viral Pneumonia"):
            prediction="Your results COVID-19 Detection result are NEGATIVE.You Probably have Viral Pneumonia."
        if(prediction=="COVID"):
            prediction="Your results COVID Detection result are POSITIVE " 
 
    return render_template("template.html",image_name=filename,text=prediction)

@app.route('/upload/<filename>')
def send_image(filename):
    return send_from_directory("images", filename)


@app.route('/gfg', methods =["GET", "POST"])
def gfg():
    if request.method == "POST":
       s=request.form.getlist('symptom[]')
       count_n=len(s)
       prob=math.ceil((count_n/13)*100)
       if(prob<50.0):
         analysis="According to your symptoms you have {}% chances of having Mucormycosis.Therefore,Your Result is negative for Mucormycosis*".format(prob)
         
       else: 
         analysis="According to your symptoms you have {}% chances of having Mucormycosis.Therefore,Your Result is positive for Mucormycosis*".format(prob)
           
    return render_template("template2.html", text=analysis)

if __name__ == "__main__":
    app.run(debug=False)
