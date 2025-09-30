import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Calendar,
  DollarSign,
  Download,
  Send,
  Eye,
  Edit,
  Plus,
  Gavel,
  Home,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  propertyAddress: string;
  transactionType: 'purchase' | 'sale' | 'foreclosure' | 'wholesale';
  status: 'contract' | 'inspection' | 'appraisal' | 'financing' | 'closing' | 'closed';
  price: number;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  seller: {
    name: string;
    email: string;
    phone: string;
  };
  agent: string;
  contractDate: string;
  closingDate: string;
  complianceScore: number;
  requiredDocuments: {
    name: string;
    status: 'pending' | 'completed' | 'review';
    required: boolean;
  }[];
  disclosures: {
    name: string;
    status: 'pending' | 'completed' | 'not-required';
    dueDate?: string;
  }[];
  milestones: {
    name: string;
    status: 'pending' | 'completed' | 'overdue';
    date: string;
  }[];
  foreclosureDetails?: {
    stage: 'pre-foreclosure' | 'lis-pendens' | 'auction' | 'reo';
    courtCase?: string;
    auctionDate?: string;
    redemptionPeriod?: string;
  };
}

const Transactions = () => {
  const [selectedTab, setSelectedTab] = useState('active');

  // Mock transaction data with Florida-specific compliance
  const transactions: Transaction[] = [
    {
      id: 'FL-2024-001',
      propertyAddress: '123 Ocean Drive, Miami Beach, FL 33139',
      transactionType: 'purchase',
      status: 'inspection',
      price: 1250000,
      buyer: {
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '(305) 555-0123'
      },
      seller: {
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '(305) 555-0456'
      },
      agent: 'Sarah Johnson',
      contractDate: '2024-09-15',
      closingDate: '2024-10-15',
      complianceScore: 95,
      requiredDocuments: [
        { name: 'AS IS Residential Contract', status: 'completed', required: true },
        { name: 'Property Disclosure', status: 'completed', required: true },
        { name: 'Lead-Based Paint Disclosure', status: 'completed', required: false },
        { name: 'Flood Zone Disclosure', status: 'review', required: true },
        { name: 'Condo Association Documents', status: 'pending', required: true }
      ],
      disclosures: [
        { name: 'Property Condition Disclosure', status: 'completed' },
        { name: 'Flood Zone Disclosure', status: 'completed' },
        { name: 'HOA/Condo Disclosure', status: 'pending', dueDate: '2024-09-30' }
      ],
      milestones: [
        { name: 'Contract Executed', status: 'completed', date: '2024-09-15' },
        { name: 'Inspection Period', status: 'completed', date: '2024-09-22' },
        { name: 'Appraisal Ordered', status: 'pending', date: '2024-09-28' },
        { name: 'Loan Approval', status: 'pending', date: '2024-10-05' },
        { name: 'Final Walkthrough', status: 'pending', date: '2024-10-14' },
        { name: 'Closing', status: 'pending', date: '2024-10-15' }
      ]
    },
    {
      id: 'FL-2024-002',
      propertyAddress: '456 Sunset Boulevard, Tampa, FL 33606',
      transactionType: 'sale',
      status: 'financing',
      price: 485000,
      buyer: {
        name: 'Jennifer Smith',
        email: 'jennifer.smith@email.com',
        phone: '(813) 555-0789'
      },
      seller: {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '(813) 555-0321'
      },
      agent: 'Mike Rodriguez',
      contractDate: '2024-09-10',
      closingDate: '2024-10-10',
      complianceScore: 98,
      requiredDocuments: [
        { name: 'AS IS Residential Contract', status: 'completed', required: true },
        { name: 'Property Disclosure', status: 'completed', required: true },
        { name: 'Lead-Based Paint Disclosure', status: 'completed', required: true },
        { name: 'Seller Financing Addendum', status: 'completed', required: true }
      ],
      disclosures: [
        { name: 'Property Condition Disclosure', status: 'completed' },
        { name: 'Lead-Based Paint Disclosure', status: 'completed' },
        { name: 'Seller Financing Disclosure', status: 'completed' }
      ],
      milestones: [
        { name: 'Contract Executed', status: 'completed', date: '2024-09-10' },
        { name: 'Inspection Period', status: 'completed', date: '2024-09-17' },
        { name: 'Appraisal Completed', status: 'completed', date: '2024-09-24' },
        { name: 'Loan Processing', status: 'pending', date: '2024-10-01' },
        { name: 'Final Walkthrough', status: 'pending', date: '2024-10-09' },
        { name: 'Closing', status: 'pending', date: '2024-10-10' }
      ]
    },
    {
      id: 'FL-2024-003',
      propertyAddress: '321 Beach Road, Fort Lauderdale, FL 33316',
      transactionType: 'foreclosure',
      status: 'contract',
      price: 180000,
      buyer: {
        name: 'Investment Group LLC',
        email: 'contact@investmentgroup.com',
        phone: '(954) 555-0654'
      },
      seller: {
        name: 'Bank of America',
        email: 'reo@bankofamerica.com',
        phone: '(954) 555-0987'
      },
      agent: 'David Chen',
      contractDate: '2024-09-20',
      closingDate: '2024-10-20',
      complianceScore: 88,
      requiredDocuments: [
        { name: 'Foreclosure Purchase Contract', status: 'completed', required: true },
        { name: 'Property Disclosure', status: 'review', required: true },
        { name: 'Lead-Based Paint Disclosure', status: 'completed', required: true },
        { name: 'REO Addendum', status: 'completed', required: true }
      ],
      disclosures: [
        { name: 'Foreclosure Property Disclosure', status: 'completed' },
        { name: 'Lead-Based Paint Disclosure', status: 'completed' },
        { name: 'Property Condition Disclosure', status: 'pending', dueDate: '2024-09-27' }
      ],
      milestones: [
        { name: 'Offer Accepted', status: 'completed', date: '2024-09-20' },
        { name: 'Inspection Period', status: 'pending', date: '2024-09-27' },
        { name: 'Financing Approval', status: 'pending', date: '2024-10-05' },
        { name: 'Title Search', status: 'pending', date: '2024-10-10' },
        { name: 'Closing', status: 'pending', date: '2024-10-20' }
      ],
      foreclosureDetails: {
        stage: 'reo',
        courtCase: 'FLBC-2023-12345',
        redemptionPeriod: 'Expired'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'contract': return 20;
      case 'inspection': return 40;
      case 'appraisal': return 60;
      case 'financing': return 80;
      case 'closing': return 95;
      case 'closed': return 100;
      default: return 0;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{transaction.propertyAddress}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{transaction.id}</Badge>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Badge>
              {transaction.transactionType === 'foreclosure' && (
                <Badge variant="destructive">
                  <Gavel className="w-3 h-3 mr-1" />
                  Foreclosure
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatPrice(transaction.price)}</p>
            <p className="text-sm text-muted-foreground">
              Closing: {new Date(transaction.closingDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Transaction Progress</span>
            <span>{getProgressValue(transaction.status)}%</span>
          </div>
          <Progress value={getProgressValue(transaction.status)} className="h-2" />
        </div>

        {/* Compliance Score */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Florida Compliance Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${getComplianceColor(transaction.complianceScore)}`}>
              {transaction.complianceScore}%
            </span>
            {transaction.complianceScore >= 95 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Buyer</p>
            <p className="text-sm">{transaction.buyer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Seller</p>
            <p className="text-sm">{transaction.seller.name}</p>
          </div>
        </div>

        {/* Key Documents Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Required Documents</p>
          <div className="grid grid-cols-2 gap-2">
            {transaction.requiredDocuments.slice(0, 4).map((doc, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {doc.status === 'completed' ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : doc.status === 'review' ? (
                  <Clock className="w-3 h-3 text-blue-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                )}
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Foreclosure Details */}
        {transaction.foreclosureDetails && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-orange-800 mb-2">Foreclosure Details</p>
            <div className="space-y-1 text-xs text-orange-700">
              <p>Stage: {transaction.foreclosureDetails.stage.toUpperCase()}</p>
              {transaction.foreclosureDetails.courtCase && (
                <p>Court Case: {transaction.foreclosureDetails.courtCase}</p>
              )}
              {transaction.foreclosureDetails.redemptionPeriod && (
                <p>Redemption: {transaction.foreclosureDetails.redemptionPeriod}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-1" />
            Documents
          </Button>
          <Button variant="outline" size="sm">
            <Send className="w-4 h-4 mr-1" />
            DocuSign
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const filteredTransactions = transactions.filter(transaction => {
    switch (selectedTab) {
      case 'active':
        return transaction.status !== 'closed';
      case 'foreclosure':
        return transaction.transactionType === 'foreclosure';
      case 'closing':
        return transaction.status === 'closing';
      case 'completed':
        return transaction.status === 'closed';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">
            Florida-compliant contract generation and transaction tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status !== 'closed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPrice(transactions.filter(t => t.status !== 'closed').reduce((sum, t) => sum + t.price, 0))} volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status === 'closing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              2 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Average across all transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foreclosure Deals</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.transactionType === 'foreclosure').length}
            </div>
            <p className="text-xs text-muted-foreground">
              1 new this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({transactions.filter(t => t.status !== 'closed').length})</TabsTrigger>
          <TabsTrigger value="foreclosure">Foreclosure ({transactions.filter(t => t.transactionType === 'foreclosure').length})</TabsTrigger>
          <TabsTrigger value="closing">Closing ({transactions.filter(t => t.status === 'closing').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed (0)</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {selectedTab === 'completed' 
                  ? 'No completed transactions yet'
                  : 'No transactions match the selected filter'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Florida Compliance Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Florida Compliance Tools
          </CardTitle>
          <CardDescription>
            Quick access to Florida-specific forms and compliance resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <FileCheck className="w-6 h-6 mb-2 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">AS IS Contract Generator</p>
                <p className="text-sm text-muted-foreground">FloridaRealtors-FloridaBar forms</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <AlertTriangle className="w-6 h-6 mb-2 text-orange-600" />
              <div className="text-left">
                <p className="font-medium">Disclosure Manager</p>
                <p className="text-sm text-muted-foreground">Required Florida disclosures</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Gavel className="w-6 h-6 mb-2 text-purple-600" />
              <div className="text-left">
                <p className="font-medium">Foreclosure Workflow</p>
                <p className="text-sm text-muted-foreground">Judicial process tracking</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;