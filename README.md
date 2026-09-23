# ♻️ Waste Classification & Pricing Platform

An AI-powered Waste Classification & Pricing Platform that classifies scrap materials from uploaded images and predicts their estimated market price using Deep Learning and Machine Learning.

---

##  Overview

This project automates waste classification and pricing by combining Computer Vision with Machine Learning. Users can upload an image of a waste item, and the system identifies the waste category and estimates its market price.

---

##  Features

-  Upload waste images
-  CNN-based waste classification
-  XGBoost price prediction
-  FastAPI REST API
-  PostgreSQL database integration
-  Real-time predictions
-  User-friendly frontend

---

##  Tech Stack

### Frontend
- HTML
- CSS
- 

### Backend
- Python
- FastAPI

### Machine Learning
- PyTorch
- CNN
- XGBoost
- OpenCV
- NumPy
- Pandas
- Scikit-learn

### Database
- PostgreSQL

---

##  Project Structure

```
Waste-Classification-Pricing-Platform/
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── index.html
│
├── README.md
└── .gitignore
```

---

##  Installation

### Clone Repository

```bash
git clone https://github.com/shifashikalgar19/Waste-Classification-Pricing-Platform.git
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Workflow

1. Upload a waste image.
2. Image preprocessing is performed.
3. CNN classifies the waste category.
4. XGBoost predicts the estimated price.
5. FastAPI returns the prediction.
6. Data is stored in PostgreSQL.
7. Results are displayed on the frontend.

---

##  Future Enhancements

- User Authentication
- Admin Dashboard
- Docker Deployment
- Cloud Deployment
- Mobile Application
- Additional Waste Categories
- Improved Pricing Model

---

##  Author

**Shifa Shikalgar**

- Backend Developer
- AI & Data Science Student
- Python | FastAPI | PostgreSQL | Machine Learning

GitHub: https://github.com/shifashikalgar19

---

## ⭐ If you found this project useful, consider giving it a Star.
