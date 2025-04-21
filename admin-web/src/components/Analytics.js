import React, { useEffect, useState } from 'react';
import BackButton from '../utils/navigationUtils';
import '../css/Analytics.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { api, } from '../api/api';

function Analytics() {
  const [loginData, setLoginData] = useState({
    today: [],
    week: [],
    month: [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [timeframe, setTimeframe] = useState('day');
  const [activeAccounts, setActiveAccounts] = useState(0);
  const [deactivatedAccounts, setDeactivatedAccounts] = useState(0);

  useEffect(() => {
    fetchLoginAnalytics();
    fetchActiveAccounts();
    fetchInactiveAccounts();
  }, []);

  useEffect(() => {
    if (timeframe === 'day') setFilteredData(loginData.today);
    else if (timeframe === 'week') setFilteredData(loginData.week);
    else setFilteredData(loginData.month);
  }, [timeframe, loginData]);

  const fetchLoginAnalytics = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await api.get(
        '/adminRoutes/admin/analytics/numberOfLogins',{ 
          headers: { Authorization: `Bearer ${token}` } 
        });
      const data = res.data;
      const fillMissingHours = () => {
        const fullDay = [];
        const hourlyMap = new Map();

        //convert each UTC hour to local hour
        data.today.hourly.forEach(({ hour, count }) => {
          const utcDate = new Date();
          utcDate.setUTCHours(hour, 0, 0, 0);
          const localHour = utcDate.getHours(); //local hour
          hourlyMap.set(localHour, (hourlyMap.get(localHour) || 0) + count);
        });

        for (let hour = 0; hour < 24; hour++) {
          fullDay.push({ date: `${hour}:00`, logins: hourlyMap.get(hour) || 0 });
        }

        return fullDay;
      };

      const fillMissingDays = (entries, totalDays) => {
        const map = new Map();

        entries.forEach(({ date, count }) => {
          const localDate = new Date(date);
          const label = localDate.toLocaleDateString();
          map.set(label, (map.get(label) || 0) + count);
        });

        const result = [];
        for (let i = totalDays - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const label = d.toLocaleDateString();
          result.push({ date: label, logins: map.get(label) || 0 });
        }

        return result;
      };

      setLoginData({
        today: fillMissingHours(),
        week: fillMissingDays(data.week.daily, 7),
        month: fillMissingDays(data.month.daily, 30),
      });
      // console.log(loginData.today);
      // console.log(loginData.week);
      // console.log(loginData.month);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchActiveAccounts = async () => {
    const token = sessionStorage.getItem("token");
    const response = await api.get(
      '/adminRoutes/admin/analytics/numberOfActiveAccounts',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response.data);
    setActiveAccounts(response.data);
  }

  const fetchInactiveAccounts = async () => {
    const token = sessionStorage.getItem("token");
    const response = await api.get(
      '/adminRoutes/admin/analytics/numberOfInactiveAccounts',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response.data);
    setDeactivatedAccounts(response.data);
  }

  return (
    <div className="analytics-container">
      <BackButton />
      <h2>Analytics Dashboard</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Active Accounts</h3>
          <p>{activeAccounts ? activeAccounts.activeUsers : "Loading Active Accounts"}</p>
          <h3>Number of Deactivated Accounts</h3>
          <p>{deactivatedAccounts ? deactivatedAccounts.inactiveUsers : "Loading Deactivated Accounts"}</p>
          <h3>Active Ratio %</h3>
          <p>
            {Math.round((activeAccounts.activeUsers / (activeAccounts.activeUsers + deactivatedAccounts.inactiveUsers)) * 100)} %
          </p>
        </div>
        <div className="analytics-card">
          <h3>Login Timeline</h3>
          <p>
            {timeframe === 'day' && Array.isArray(loginData.today) &&
              `Total Logins Today: ${loginData.today.reduce((sum, entry) => sum + entry.logins, 0)}`}
            {timeframe === 'week' && Array.isArray(loginData.week) &&
              `Total Logins This Week: ${loginData.week.reduce((sum, entry) => sum + entry.logins, 0)}`}
            {timeframe === 'month' && Array.isArray(loginData.month) &&
              `Total Logins This Month: ${loginData.month.reduce((sum, entry) => sum + entry.logins, 0)}`}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <button onClick={() => setTimeframe('day')}>Today</button>
            <button onClick={() => setTimeframe('week')}>Past Week</button>
            <button onClick={() => setTimeframe('month')}>Past Month</button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData} margin={{ top: 20, right: 20, bottom: 40, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                label={{
                  value: timeframe === 'day' ? 'Hour of Day' : 'Date',
                  position: 'insideBottom',
                  offset: -10
                }}
              />
              <YAxis
                label={{
                  value: 'Number of Logins',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip />
              <Line type="monotone" dataKey="logins" stroke="#2e5339" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
