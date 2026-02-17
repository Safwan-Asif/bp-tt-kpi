
export interface ProductivityData {
  DATE: string;
  Month: string;
  Week: string;
  Team: string;
  RouteNo: string;
  SalesmanName: string;
  OutletsAssigned: number;
  OutletsBilled: number;
  PJPPlanned: number;
  PJPFollowed: number;
  LineProductivity: number;
  CallProductivity: number;
  AverageBillValue: number;
  AverageDailySales: number;
}

export interface PerformanceData {
  DATE: string;
  Month: string;
  Week: string;
  Team: string;
  RouteNo: string;
  SalesmanName: string;
  Category: 'FLOUR' | 'OIL' | 'FOCUS' | 'RICE' | 'TOTAL';
  SalesValue: number;
  MonthlyTarget: number;
}

export interface CategoryBilledData {
  DATE: string;
  Month: string;
  Week: string;
  Team: string;
  RouteNo: string;
  SalesmanName: string;
  Category: string;
  OutletsBilled: number;
}

export interface DashboardState {
  productivity: ProductivityData[];
  performance: PerformanceData[];
  categoryBilled: CategoryBilledData[];
  loading: boolean;
  error: string | null;
}

export interface Filters {
  month: string;
  week: string;
  team: string;
  routeNo: string;
  salesman: string;
  category: string;
}
