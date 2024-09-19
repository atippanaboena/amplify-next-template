"use client";
import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";

// Sample data for the charts
const lineChartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 700 },
  { name: "May", value: 600 },
];

const barChartData = [
  { name: "Product A", sales: 1200 },
  { name: "Product B", sales: 800 },
  { name: "Product C", sales: 600 },
];

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-stretch justify-between w-full">
          {/* Card 1: Submissions */}
          <Paper className="p-4" elevation={10}>
            <h2 className="text-xl font-semibold mb-2">Submissions</h2>
            <p className="text-2xl font-bold text-green-500">350</p>
            <p className="text-gray-600">Total submissions this month</p>
          </Paper>

          {/* Card 2: Claims in Progress */}
          <Paper className="p-4" elevation={10}>
            <h2 className="text-xl font-semibold mb-2">Claims in Progress</h2>
            <p className="text-2xl font-bold text-blue-500">47</p>
            <p className="text-gray-600">Currently being processed</p>
          </Paper>

          {/* Card 3: Total Users */}
          <Paper className="p-4" elevation={10}>
            <h2 className="text-xl font-semibold mb-2">Not Processable</h2>
            <p className="text-2xl font-bold text-red-500">3</p>
            <p className="text-gray-600">Claims that cannot be processed</p>
          </Paper>

          {/* Card 4: Pending Approvals */}
          <Paper className="p-4" elevation={10}>
            <h2 className="text-xl font-semibold mb-2">Resubmission</h2>
            <p className="text-2xl font-bold text-yellow-500">15</p>
            <p className="text-gray-600">Rooms Waiting for New Images</p>
          </Paper>

          {/* Card 5: Pending Approvals */}
          <Paper className="p-4" elevation={10}>
            <h2 className="text-xl font-semibold mb-2">Pending Approvals</h2>
            <p className="text-2xl font-bold text-teal-500">2</p>
            <p className="text-gray-600">Awaiting approval</p>
          </Paper>
        </div>
        <div className="flex gap-4 justify-around w-full">
          <div className="w-full">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sales Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Sales
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Dashboard;
