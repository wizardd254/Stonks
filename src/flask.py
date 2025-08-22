from flask import Flask, jsonify, request, url_for, redirect, render_template
import pickle
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from flask_cors import CORS

# from tensorflow.python.keras.models import load_model
import keras


from sklearn.preprocessing import StandardScaler
import numpy as np

import tensorflow as tf

print("TensorFlow version:", tf.__version__)

def get_historical_stock_data(symbol, end_date_str, scaler_close, scaler_ohlcv, days=200):
    # Convert the end_date_str to a datetime object
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    # Calculate the start date by subtracting 'days' from the end_date
    start_date = end_date - timedelta(days=days)
    # Fetch data from yfinance
    data = yf.download(symbol, start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
    # Make sure we have only the number of days requested (100 days)
    if len(data) > days:
        data = data.iloc[-days:]
    historical_data = data
    df = historical_data[['Open', 'High', 'Low', 'Close', 'Volume']]
    df1 = historical_data['Close']
    df2 = df1.index
    df2=df2.strftime('%Y-%m-%d')
    df1=df1.to_numpy()
    df2 = df2.to_numpy()
    df1=df1.tolist()
    df2=df2.tolist()
   
    df.index = pd.to_datetime(df.index)
    # Display the DataFrame with date index
    #  Create a scaler for the 'Close' column
    close_scaled = scaler_close.fit_transform(df[['Close']])
    ohlcv_scaled = scaler_ohlcv.fit_transform(df[['Open', 'High', 'Low', 'Volume']])
    # Combine the scaled columns back into one DataFrame
    df = pd.DataFrame(ohlcv_scaled, columns=['Open', 'High', 'Low', 'Volume'], index=df.index)
    df['Close'] = close_scaled
    df = df[:100]
    df_as_np = df.to_numpy()
    X = []
    row = [a for a in df_as_np[:]]
    X.append(row)
    return np.array(X) , df2 , df1


app = Flask(__name__)
CORS(app)
symbol_input = 'BAC'  # Replace with the stock symbol you're interested in
date_input = '2024-02-19'  # Replace with the end date you want data up to


@app.route('/', methods=['POST', 'GET'])
def predict():
    if request.method == 'POST':
        # Extract form data
        symbol = request.args.get('symbol')
        date = request.args.get('date')
        price=[]
        day=[]
        model5 = keras.models.load_model(f'C:/WebDev/Stonks/models/{symbol}2.h5')

        # Fetch and preprocess data
        from sklearn.preprocessing import StandardScaler
        scaler_close = StandardScaler()
        scaler_ohlcv = StandardScaler()
        X,xi,yi = get_historical_stock_data(symbol, date, scaler_close, scaler_ohlcv)

        prediction = model5.predict(X).flatten()
        pred_unscaled = scaler_close.inverse_transform(prediction.reshape(-1, 1)).flatten()

        final_pred = float(pred_unscaled[-1])
        print(final_pred)
        response_data = {
            'symbol': symbol,
            'final_pred': final_pred,
            'price':yi,  # Add your price data here
            'day': xi    # Add your date data here
        }

        return jsonify(response_data)

        return render_template('template.ejs', pred=final_pred)
    else:
        return render_template('template.ejs')


if __name__ == '__main__':
    app.run(debug=True)

