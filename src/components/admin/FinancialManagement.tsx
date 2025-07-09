import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CreditCard, 
  Banknote,
  PieChart,
  BarChart3,
  Download,
  Plus,
  Minus,
  Receipt,
  Wallet,
  Target,
  AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Booking } from '../../lib/supabase';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'pix';
  bookingId?: string;
}

interface Commission {
  barberId: string;
  barberName: string;
  totalRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  servicesCount: number;
}

interface FinancialManagementProps {
  bookings: Booking[];
}

const FinancialManagement: React.FC<FinancialManagementProps> = ({ bookings }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });

  useEffect(() => {
    generateTransactionsFromBookings();
  }, [bookings]);

  const generateTransactionsFromBookings = () => {
    const bookingTransactions: Transaction[] = bookings
      .filter(booking => booking.status === 'concluido')
      .map(booking => ({
        id: `booking-${booking.id}`,
        type: 'income' as const,
        category: 'Serviços',
        description: `${booking.service?.name} - ${booking.client?.name}`,
        amount: booking.total_price,
        date: booking.booking_date,
        paymentMethod: Math.random() > 0.5 ? 'card' : 'cash' as any,
        bookingId: booking.id
      }));

    // Add some sample expenses
    const sampleExpenses: Transaction[] = [
      {
        id: 'exp-1',
        type: 'expense',
        category: 'Produtos',
        description: 'Shampoo e condicionador',
        amount: 150.00,
        date: '2024-12-20',
        paymentMethod: 'card'
      },
      {
        id: 'exp-2',
        type: 'expense',
        category: 'Equipamentos',
        description: 'Manutenção máquina de corte',
        amount: 80.00,
        date: '2024-12-18',
        paymentMethod: 'cash'
      },
      {
        id: 'exp-3',
        type: 'expense',
        category: 'Aluguel',
        description: 'Aluguel do espaço',
        amount: 2500.00,
        date: '2024-12-01',
        paymentMethod: 'pix'
      }
    ];

    setTransactions([...bookingTransactions, ...sampleExpenses]);
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (selectedPeriod) {
      case 'current-month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const calculateFinancialSummary = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Payment method breakdown
    const paymentMethods = {
      cash: filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0),
      card: filteredTransactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.amount, 0),
      pix: filteredTransactions.filter(t => t.paymentMethod === 'pix').reduce((sum, t) => sum + t.amount, 0)
    };

    // Category breakdown for expenses
    const expenseCategories: { [key: string]: number } = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
      });

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      paymentMethods,
      expenseCategories
    };
  };

  const calculateCommissions = () => {
    const completedBookings = bookings.filter(b => b.status === 'concluido');
    const commissionRate = 0.4; // 40% commission rate
    
    const commissionsByBarber: { [key: string]: Commission } = {};
    
    completedBookings.forEach(booking => {
      if (!booking.barber_id || !booking.barber) return;
      
      if (!commissionsByBarber[booking.barber_id]) {
        commissionsByBarber[booking.barber_id] = {
          barberId: booking.barber_id,
          barberName: booking.barber.name,
          totalRevenue: 0,
          commissionRate,
          commissionAmount: 0,
          servicesCount: 0
        };
      }
      
      commissionsByBarber[booking.barber_id].totalRevenue += booking.total_price;
      commissionsByBarber[booking.barber_id].servicesCount += 1;
    });
    
    // Calculate commission amounts
    Object.values(commissionsByBarber).forEach(commission => {
      commission.commissionAmount = commission.totalRevenue * commission.commissionRate;
    });
    
    return Object.values(commissionsByBarber);
  };

  const addTransaction = () => {
    if (!newTransaction.category || !newTransaction.description || !newTransaction.amount) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const transaction: Transaction = {
      id: `manual-${Date.now()}`,
      type: newTransaction.type!,
      category: newTransaction.category!,
      description: newTransaction.description!,
      amount: Number(newTransaction.amount),
      date: newTransaction.date!,
      paymentMethod: newTransaction.paymentMethod!
    };

    setTransactions(prev => [transaction, ...prev]);
    setNewTransaction({
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
    setShowTransactionModal(false);
  };

  const exportFinancialReport = () => {
    const summary = calculateFinancialSummary();
    const commissions = calculateCommissions();
    const filteredTransactions = getFilteredTransactions();
    
    const reportData = {
      period: selectedPeriod,
      summary,
      commissions,
      transactions: filteredTransactions,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = calculateFinancialSummary();
  const commissions = calculateCommissions();
  const filteredTransactions = getFilteredTransactions();

  const renderFinancialCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">Receita Total</p>
            <p className="text-3xl font-bold text-white">
              R$ {summary.totalIncome.toFixed(2).replace('.', ',')}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-sm text-green-300">+12.5% vs mês anterior</span>
            </div>
          </div>
          <DollarSign className="w-10 h-10 text-green-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">Despesas Totais</p>
            <p className="text-3xl font-bold text-white">
              R$ {summary.totalExpenses.toFixed(2).replace('.', ',')}
            </p>
            <div className="flex items-center mt-2">
              <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              <span className="text-sm text-red-300">-5.2% vs mês anterior</span>
            </div>
          </div>
          <Receipt className="w-10 h-10 text-red-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">Lucro Líquido</p>
            <p className="text-3xl font-bold text-white">
              R$ {summary.netProfit.toFixed(2).replace('.', ',')}
            </p>
            <div className="flex items-center mt-2">
              <Target className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-sm text-blue-300">
                Margem: {summary.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
          <Wallet className="w-10 h-10 text-blue-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-400">Comissões Totais</p>
            <p className="text-3xl font-bold text-white">
              R$ {commissions.reduce((sum, c) => sum + c.commissionAmount, 0).toFixed(2).replace('.', ',')}
            </p>
            <div className="flex items-center mt-2">
              <BarChart3 className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm text-yellow-300">
                {commissions.length} barbeiros
              </span>
            </div>
          </div>
          <CreditCard className="w-10 h-10 text-yellow-400" />
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodsChart = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <PieChart className="w-6 h-6 mr-2 text-yellow-400" />
        Métodos de Pagamento
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Banknote className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-white">Dinheiro</h4>
          <p className="text-2xl font-bold text-green-400">
            R$ {summary.paymentMethods.cash.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-400">
            {((summary.paymentMethods.cash / summary.totalIncome) * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-white">Cartão</h4>
          <p className="text-2xl font-bold text-blue-400">
            R$ {summary.paymentMethods.card.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-400">
            {((summary.paymentMethods.card / summary.totalIncome) * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-semibold text-white">PIX</h4>
          <p className="text-2xl font-bold text-purple-400">
            R$ {summary.paymentMethods.pix.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-400">
            {((summary.paymentMethods.pix / summary.totalIncome) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );

  const renderCommissionsTable = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2 text-yellow-400" />
        Comissões dos Barbeiros
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">Barbeiro</th>
              <th className="text-left p-4 text-gray-300 font-medium">Serviços</th>
              <th className="text-left p-4 text-gray-300 font-medium">Receita</th>
              <th className="text-left p-4 text-gray-300 font-medium">Taxa</th>
              <th className="text-left p-4 text-gray-300 font-medium">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission.barberId} className="border-t border-gray-700/50">
                <td className="p-4">
                  <div className="font-medium text-white">{commission.barberName}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-300">{commission.servicesCount}</div>
                </td>
                <td className="p-4">
                  <div className="text-green-400 font-semibold">
                    R$ {commission.totalRevenue.toFixed(2).replace('.', ',')}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-gray-300">{(commission.commissionRate * 100).toFixed(0)}%</div>
                </td>
                <td className="p-4">
                  <div className="text-yellow-400 font-semibold">
                    R$ {commission.commissionAmount.toFixed(2).replace('.', ',')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransactionsList = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Receipt className="w-6 h-6 mr-2 text-yellow-400" />
          Transações Recentes
        </h3>
        <button
          onClick={() => setShowTransactionModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Transação</span>
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'income' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>
                {transaction.type === 'income' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-medium text-white">{transaction.description}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  <span>•</span>
                  <span className="capitalize">{transaction.paymentMethod}</span>
                </div>
              </div>
            </div>
            <div className={`text-lg font-bold ${
              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2).replace('.', ',')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactionModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Nova Transação</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'income' | 'expense'})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
            <input
              type="text"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              placeholder="Ex: Produtos, Aluguel, Equipamentos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              placeholder="Descrição da transação"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pagamento</label>
            <select
              value={newTransaction.paymentMethod}
              onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value as any})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
            >
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="pix">PIX</option>
            </select>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex space-x-3">
          <button
            onClick={() => setShowTransactionModal(false)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={addTransaction}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão Financeira</h2>
          <p className="text-gray-400">Controle completo das finanças da barbearia</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
          >
            <option value="today">Hoje</option>
            <option value="current-month">Mês Atual</option>
          </select>
          
          <button
            onClick={exportFinancialReport}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {renderFinancialCards()}
      {renderPaymentMethodsChart()}
      {renderCommissionsTable()}
      {renderTransactionsList()}
      
      {showTransactionModal && renderTransactionModal()}
    </div>
  );
};

export default FinancialManagement;