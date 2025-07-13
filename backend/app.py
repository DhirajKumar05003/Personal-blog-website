import uuid
from flask import Flask, request, jsonify, send_from_directory
import os
import json

app = Flask(__name__)
BLOG_FILE = 'blogs.json'
UPLOAD_FOLDER = 'uploads'

if not os.path.exists(BLOG_FILE):
    with open(BLOG_FILE, 'w') as f:
        json.dump([], f)
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def load_blogs():
    with open(BLOG_FILE, 'r') as f:
        return json.load(f)

def save_blogs(blogs):
    with open(BLOG_FILE, 'w') as f:
        json.dump(blogs, f, indent=2)

@app.route('/')
def home():
    return 'Hello, Flask is working!'

@app.route('/blogs', methods=['GET'])
def get_blogs():
    blogs = load_blogs()
    # Return preview: id, title, image, excerpt (first 100 chars)
    previews = [
        {
            'id': blog['id'],
            'title': blog['title'],
            'image': blog.get('image'),
            'excerpt': blog['content'][:120] + ('...' if len(blog['content']) > 120 else '')
        }
        for blog in blogs
    ]
    return jsonify(previews)

@app.route('/blog/<blog_id>', methods=['GET'])
def get_blog(blog_id):
    blogs = load_blogs()
    for blog in blogs:
        if blog['id'] == blog_id:
            return jsonify(blog)
    return jsonify({'error': 'Blog not found'}), 404

@app.route('/publish', methods=['POST'])
def publish_blog():
    if request.content_type.startswith('multipart/form-data'):
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        image = request.files.get('image')
    else:
        data = request.get_json()
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        image = None
    if not title or not content:
        return jsonify({'success': False, 'message': 'Title and content required.'}), 400
    image_filename = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        image_filename = f"{uuid.uuid4().hex}{ext}"
        image.save(os.path.join(UPLOAD_FOLDER, image_filename))
    blogs = load_blogs()
    blog = {
        'id': uuid.uuid4().hex,
        'title': title,
        'content': content,
        'image': image_filename
    }
    blogs.insert(0, blog)
    save_blogs(blogs)
    return jsonify({'success': True, 'message': 'Blog published.'})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

if __name__ == '__main__':
    app.run(debug=True) 