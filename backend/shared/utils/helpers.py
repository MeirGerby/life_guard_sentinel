import random


def generate_id():
    return random.randint(1000, 9999)


def calculate_distance(lat1, lon1, lat2, lon2):
    return ((lat1 - lat2)**2 + (lon1 - lon2)**2) ** 0.5