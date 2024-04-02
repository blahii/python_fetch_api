from flask import Flask, render_template, send_file
import pandas as pd
import requests

app = Flask(__name__)


def transform_data(input_data):
    flat_data = []
    for entry in input_data:

        units_types_list = entry.get("Units_types", []) 
        units_types_str = ", ".join(units_types_list)  

        completion_date = entry.get("Completion_date", "")
        year = None 

        unit_bedrooms_list = [price.get("unit_bedrooms", "N/A") if price.get("unit_bedrooms") is not None else "N/A" for price in entry.get("Starting_price", [])]
        unit_bedrooms_str = ", ".join(unit_bedrooms_list)

        price_from_aed_list = [int(price.get("Price_from_AED", 0)) for price in entry.get("Starting_price", []) if price.get("Price_from_AED") is not None]
        price_to_aed_list = [int(price.get("Price_to_AED", 0)) for price in entry.get("Starting_price", []) if price.get("Price_to_AED") is not None]

        price_from_aed_list = [price for price in price_from_aed_list if price > 0] if any(price > 0 for price in price_from_aed_list) else price_from_aed_list
        price_to_aed_list = [price for price in price_to_aed_list if price > 0] if any(price > 0 for price in price_to_aed_list) else price_to_aed_list

        min_price_from_aed = min(price_from_aed_list) if price_from_aed_list else 0
        max_price_to_aed = max(price_to_aed_list) if price_to_aed_list else 0

        if completion_date:
            parts = completion_date.split(' ')
            if len(parts) == 2:
                part1, part2 = parts
                if "Q" in part1:
                    quarter = part1
                    year = part2
                    month = None
                else:
                    month = part1
                    year = part2
                    quarter = None
            else:
                quarter = month = None
        

        if min_price_from_aed > 0 and max_price_to_aed == 0:
            max_price_to_aed = min_price_from_aed

        cover_url = entry.get("cover", {}).get("url", "N/A")

        flat_entry = {
            "id": entry.get("id"),
            "Display_All": entry.get("Display_All"),
            "Completion_date": entry.get("Completion_date"),
            "Year": year,
            "Quarter": quarter,
            "Month": month,
            "Coordinates": entry.get("Coordinates"),
            "Project_name": entry.get("Project_name"),
            "Developers_name": entry.get("Developers_name"),
            "Area_name": entry.get("Area_name"),
            "Units_types": units_types_str, 
            "Region": entry.get("Region"),
            "Publish": entry.get("Publish"),
            "Status": entry.get("Status"),
            "Priority": entry.get("Priority"),
            "Floors": entry.get("Floors"),
            "Furnishing": entry.get("Furnishing"),
            "Unit_bedrooms": unit_bedrooms_str,
            "Price_from_AED": str(min_price_from_aed),
            "Price_to_AED": str(max_price_to_aed),
            "Publish": entry.get("Publish"),
            "Cover_URL": cover_url
        }
        flat_data.append(flat_entry)
    return flat_data



def save_to_csv(data):
    df = pd.DataFrame(data)

    df['Unit_bedrooms'] = df['Unit_bedrooms'].apply(lambda x: x.split(', '))

    unique_bedrooms = set()
    df['Unit_bedrooms'].apply(lambda x: unique_bedrooms.update(x))

    for bedroom in unique_bedrooms:
        df[bedroom] = df['Unit_bedrooms'].apply(lambda x: bedroom in x)

    df.to_csv('flat_data.csv', index=False)

@app.route('/')
def show_table():
    api_url = "https://xdil-qda0-zofk.m2.xano.io/api:sk5LT7jx/project-static-render"
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        
        flat_data = transform_data(data)
        save_to_csv(flat_data)
       
        df = pd.DataFrame(flat_data)
       
        table_html = df.to_html(classes='table table-striped', index=False)
    else:
        table_html = "<p>Data errore with API.</p>"

    return render_template('table.html', table_html=table_html)

@app.route('/download-csv')
def download_csv():
    return send_file('flat_data.csv', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)


