import { UserModule } from '../modules/users/user.module';
// import { LeaveModule } from '../modules/stuff-leave/leave.module';
import { SalaryModule } from '../modules/staff-salary/salary.module';
import { ItemModule } from 'src/modules/items/item.module';
import { CategoryModule } from 'src/modules/categories/category.module';
import { DiscountModule } from 'src/modules/discount/discount.module';
import { CustomerModule } from 'src/modules/customers/customer.module';
import { ExpensesModule } from 'src/modules/expenses/expenses.module';
import { TableModule } from 'src/modules/table/table.module';
import { KitchenItemModule } from 'src/modules/kitchen-items/kitchen-item.module';
import { KitchenStockModule } from 'src/modules/kitchen-stock/kitchen-stock.module';
import { KitchenOrderModule } from 'src/modules/kitchen-orders/kitchen-order.module';
import { OrderModule } from 'src/modules/orders/order.module';
import { OrderItemModule } from 'src/modules/order-items/order-item.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { BankModule } from 'src/modules/banks/bank.module';
import { DiscountApplicationModule } from 'src/modules/discount-application/discount-application.module';
import { StuffAttendanceModule } from 'src/modules/stuff-attendance/stuff-attendance.module';
import { OrderTokensModule } from 'src/modules/order-tokens/order-tokens.module';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
import { ReportModule } from 'src/modules/reports/report.module';
import { CustomerAuthModule } from 'src/modules/customer-auth/customer-auth.module';
import { PublicModule } from 'src/modules/public/public.module';
import { CartModule } from 'src/modules/cart/cart.module';
import { CustomerOrdersModule } from 'src/modules/customer-orders/customer-orders.module';
import { DataManagementModule } from 'src/modules/data-management/data-management.module';

export const featureModules = [
    UserModule,
    AuthModule,
    // LeaveModule,
    SalaryModule,
    ItemModule,
    CategoryModule,
    DiscountModule,
    CustomerModule,
    ExpensesModule,
    TableModule,
    KitchenItemModule,
    KitchenStockModule,
    KitchenOrderModule,
    OrderModule,
    OrderItemModule,
    BankModule,
    DiscountApplicationModule,
    StuffAttendanceModule,
    OrderTokensModule,
    CloudinaryModule,
    ReportModule,
    CustomerAuthModule,
    PublicModule,
    CartModule,
    CustomerOrdersModule,
    DataManagementModule,
];