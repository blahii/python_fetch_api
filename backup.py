

from flask import Flask, render_template
import pandas as pd
import requests
from supabase import create_client, Client
import os

# Конфигурация Supabase
url: str = "https://bdedgvyqylyrgdhzlqhn.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZWRndnlxeWx5cmdkaHpscWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3MDY0MjcsImV4cCI6MjAyNTI4MjQyN30.xZ5acv4QVEv5kXhdOeh-omuWww89Ay1O5z7xLutIPos"
supabase: Client = create_client(url, key)

app = Flask(__name__)

def transform_data(input_data):
    """Трансформация данных из Xano API."""
    flat_data = []
    for entry in input_data:
        unit_bedrooms_list = [price.get("unit_bedrooms", "N/A") if price.get("unit_bedrooms") is not None else "N/A" for price in entry.get("Starting_price", [])]
        price_from_aed_list = [str(price.get("Price_from_AED", "0")) if price.get("Price_from_AED") is not None else "0" for price in entry.get("Starting_price", [])]
        price_to_aed_list = [str(price.get("Price_to_AED", "0")) if price.get("Price_to_AED") is not None else "0" for price in entry.get("Starting_price", [])]

        # Преобразование списков в строки, разделенные запятыми
        unit_bedrooms_str = ", ".join(unit_bedrooms_list)
        price_from_aed_str = ", ".join(price_from_aed_list)
        price_to_aed_str = ", ".join(price_to_aed_list)

        flat_entry = {
            "id": entry.get("id"),
            "Completion_date": entry.get("Completion_date"),
            "Coordinates": entry.get("Coordinates"),
            "Project_name": entry.get("Project_name"),
            "Developers_name": entry.get("Developers_name"),
            "Area_name": entry.get("Area_name"),
            "Region": entry.get("Region"),
            "Publish": entry.get("Publish"),
            "Status": entry.get("Status"),
            "Priority": entry.get("Priority"),
            "Floors": entry.get("Floors"),
            "Furnishing": entry.get("Furnishing"),
            "Unit_bedrooms": unit_bedrooms_str,
            "Price_from_AED": price_from_aed_str,
            "Price_to_AED": price_to_aed_str,
        }
        flat_data.append(flat_entry)
    return flat_data

def update_supabase(flat_data):
    """Обновление данных в Supabase."""
    table_name = "Projects"  # Replace 'YOUR_TABLE_NAME' with the name of your table in Supabase
    response = supabase.table(table_name).delete().execute()  # Add a WHERE clause to delete all rows
    if response.error:
        print(f"Ошибка при очистке таблицы: {response.error.message}")
    else:
        response = supabase.table(table_name).insert(flat_data).execute()
        if response.error:
            print(f"Ошибка при вставке данных: {response.error.message}")
        else:
            print("Данные успешно обновлены в Supabase.")

@app.route('/')
def show_table():
    """Отображение данных в виде HTML таблицы."""
    api_url = "https://xdil-qda0-zofk.m2.xano.io/api:sk5LT7jx/project-static-render"
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        flat_data = transform_data(data)
        update_supabase(flat_data)  # Обновление данных в Supabase
        df = pd.DataFrame(flat_data)
        table_html = df.to_html(classes='table table-striped', index=False)
    else:
        table_html = "<p>Ошибка при получении данных с API.</p>"
    return render_template('table.html', table_html=table_html)

if __name__ == '__main__':
    app.run(debug=True)
