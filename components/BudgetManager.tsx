import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import {
  createBudgetAllocation,
  calculateBudgetStatus,
  allocateBudgetToTeams,
  generateChargebackReport,
  forecastBudgetStatus
} from '../services/budgetService';
import { BudgetAllocation } from '../types';

export function BudgetManager() {
  const [totalBudget, setTotalBudget] = useState(50000);
  const [teamAllocations, setTeamAllocations] = useState<BudgetAllocation[]>([
    { teamName: 'Backend API', monthlyBudget: 20000, spent: 15000, period: '2025-12', alerts: [] },
    { teamName: 'ML/AI', monthlyBudget: 20000, spent: 16500, period: '2025-12', alerts: [] },
    { teamName: 'Analytics', monthlyBudget: 10000, spent: 7200, period: '2025-12', alerts: [] }
  ]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamBudget, setNewTeamBudget] = useState(10000);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const addTeam = () => {
    if (newTeamName.trim()) {
      const newAllocation = createBudgetAllocation(newTeamName, newTeamBudget, new Date().toISOString().substring(0, 7));
      setTeamAllocations([...teamAllocations, newAllocation]);
      setNewTeamName('');
      setNewTeamBudget(10000);
    }
  };

  const updateTeamSpent = (index: number, newSpent: number) => {
    const updated = [...teamAllocations];
    updated[index].spent = Math.max(0, newSpent);
    setTeamAllocations(updated);
  };

  const deleteTeam = (index: number) => {
    setTeamAllocations(teamAllocations.filter((_, i) => i !== index));
    setSelectedTeam(null);
  };

  const totalSpent = teamAllocations.reduce((sum, t) => sum + t.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const budgetUtilization = (totalSpent / totalBudget) * 100;

  const chartData = teamAllocations.map((team) => ({
    name: team.teamName,
    spent: team.spent,
    remaining: team.monthlyBudget - team.spent,
    budget: team.monthlyBudget
  }));

  const pieData = teamAllocations.map((team) => ({
    name: team.teamName,
    value: team.spent
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Budget & Chargeback Manager</h2>
        </div>
        <p className="text-gray-700">
          Allocate budgets to teams, track spending, and generate chargeback reports for cost accountability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Total Budget</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">${(totalBudget / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Total Spent</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">${(totalSpent / 1000).toFixed(0)}k</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Remaining</div>
          <div className={`text-3xl font-bold mt-1 ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(Math.abs(totalRemaining) / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Utilization</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{budgetUtilization.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Total Monthly Budget ($)</label>
        <input
          type="number"
          value={totalBudget}
          onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="1000"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Team Budget Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toFixed(0)}`} />
              <Legend />
              <Bar dataKey="spent" fill="#ef4444" name="Spent" />
              <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `$${value.toFixed(0)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Add New Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Monthly Budget"
            value={newTeamBudget}
            onChange={(e) => setNewTeamBudget(parseFloat(e.target.value) || 0)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1000"
          />
          <button
            onClick={addTeam}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Add Team
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Team Budgets & Spending</h3>
        {teamAllocations.map((team, idx) => {
          const status = calculateBudgetStatus(team, 80);
          const percentage = (team.spent / team.monthlyBudget) * 100;

          return (
            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{team.teamName}</h4>
                    {status.alertLevel === 'critical' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    {status.alertLevel === 'warning' && (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    {status.alertLevel === 'ok' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ${team.spent.toFixed(0)} / ${team.monthlyBudget.toFixed(0)} ({percentage.toFixed(1)}%)
                  </p>
                </div>
                <button
                  onClick={() => deleteTeam(idx)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded font-medium text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    percentage > 100
                      ? 'bg-red-600'
                      : percentage > 80
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              <input
                type="number"
                value={team.spent}
                onChange={(e) => updateTeamSpent(idx, parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
            </div>
          );
        })}
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex gap-2 items-start">
          <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Budget Insights</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• ML/AI team is at {((teamAllocations[1]?.spent / teamAllocations[1]?.monthlyBudget) * 100).toFixed(1)}% utilization</li>
              <li>• Analytics team has the most remaining budget capacity</li>
              <li>• Overall budget utilization is at {budgetUtilization.toFixed(1)}%</li>
              {totalRemaining < 0 && <li className="text-red-700 font-semibold">• WARNING: Budget exceeded by ${Math.abs(totalRemaining).toFixed(0)}</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
