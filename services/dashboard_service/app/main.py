import streamlit as st
import requests

API_URL = "http://api:8000"

st.title("🚗 Life Guard Sentinel Dashboard")

vehicle_id = st.number_input("Vehicle ID", min_value=1, step=1)

if st.button("Get Vehicle"):
    res = requests.get(f"{API_URL}/vehicles/{vehicle_id}")
    st.json(res.json())