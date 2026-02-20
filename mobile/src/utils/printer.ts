import { Alert } from "react-native";
import { StorageService } from "../services/storageService";
import { Order } from "../types/order";
import { base64 } from "./printerUtil";
import { formatPrettyDateOnly } from "./helpers";
import { CURRENCY_SYMBOL, formatAmount } from './currency';

function getPrinter(): any | null {
    try {
        return require('react-native-thermal-pos-printer').default;
    } catch {
        return null;
    }
}

function showPrinterUnavailable() {
    Alert.alert(
        'Printer Not Available',
        'Bluetooth printing requires a custom development build. It is not available in Expo Go.',
    );
}

const selectedPrinter = async () => {
    const saved = await StorageService.getItem('selectedPrinter');
    const printer = JSON.parse(saved || '{}');
    return printer?.device?.address;
}

const formatDateWithOrdinal = (d: Date) => {
  const day = d.getDate();
  const ord = (day % 100 > 10 && day % 100 < 14) ? 'th' : (['th','st','nd','rd'][day % 10] || 'th');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${day}${ord} ${month} ${year},${h}:${m} ${ampm}`;
};

// Print kitchen and bar token
export const printToken = async (order: Order, section: 'kitchen' | 'bar' = 'kitchen', printerAddress?: string): Promise<void> => {
  const ReactNativePosPrinter = getPrinter();
  if (!ReactNativePosPrinter) { showPrinterUnavailable(); return; }

  const printer = printerAddress || await selectedPrinter();
  try {
    const token = order.order_tokens?.[section];
    if (!token) {
      Alert.alert(`No ${section === 'kitchen' ? 'Kitchen' : 'Bar'} Items`, `This order has no ${section} items to print.`);
      return;
    }
    const printerInstance = await ReactNativePosPrinter.connectPrinter(printer);
    if (!printerInstance) {
      Alert.alert('Print Error', 'Could not get printer instance.');
      return;
    }
    const title = section === 'kitchen' ? 'KITCHEN TOKEN' : 'BAR TOKEN';
    await ReactNativePosPrinter.printText('COFFEE CLUB GO', { align: 'CENTER', size: 14, bold: true, fontType: 'A' });
    await ReactNativePosPrinter.printText('='.repeat(32));
    await ReactNativePosPrinter.printText(`*** ${title} ***`, { align: 'CENTER', size: 13, fontType: 'B' });
    await ReactNativePosPrinter.printText(`${token.token}`, { align: 'CENTER', size: 12, fontType: 'B', bold: true });
    await ReactNativePosPrinter.printText('='.repeat(32));
    await ReactNativePosPrinter.printText(`ORDER: ${order.order_id || order.id}`);
    await ReactNativePosPrinter.printText(`STATUS: ${token.status}`);
    await ReactNativePosPrinter.printText(`DATE: ${order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}`);

    if (order.order_type === 'TAKEAWAY') {
      await ReactNativePosPrinter.printText('TABLES: TAKEAWAY');
    } else if (order.tables && order.tables.length > 0) {
      const tableNumbers = order.tables.map(t => t.number).join(', ');
      await ReactNativePosPrinter.printText(`TABLES: ${tableNumbers}`);
    } else {
      await ReactNativePosPrinter.printText('TABLES: N/A');
    }

    await ReactNativePosPrinter.printText('='.repeat(32));
    await ReactNativePosPrinter.printText('*** ITEMS ***');

    for (const item of token.order_items || []) {
      await ReactNativePosPrinter.printText(`>> ${item.quantity}x ${item.item.name_bn || item.item.name} ${item.item_variation ? `(${item.item_variation.name_bn})` : ''}`, { fontType: 'C' });
    }

    await ReactNativePosPrinter.printText('-'.repeat(32));
    await ReactNativePosPrinter.printText(`Printed: ${new Date().toLocaleString()}`, { size: 10, align: 'CENTER', fontType: 'C' });
    await ReactNativePosPrinter.newLine();
    await ReactNativePosPrinter.feedLine();
    await ReactNativePosPrinter.feedLine();
    await ReactNativePosPrinter.disconnectPrinter();
    Alert.alert('Success', 'Printed successfully!');
  } catch (error) {
    console.error(`Error printing ${section} token:`, error);
  }
};

// Print receipt
export const printReceipt = async (order: Order, printerAddress?: string) => {
    const ReactNativePosPrinter = getPrinter();
    if (!ReactNativePosPrinter) { showPrinterUnavailable(); return; }

    const printer = printerAddress || await selectedPrinter();
    try{
        if (!order.order_items || order.order_items.length === 0) {
            Alert.alert(`No Items`, `This order has no items to print.`);
            return;
        }

        const printerInstance = await ReactNativePosPrinter.connectPrinter(printer);
        if (!printerInstance) {
            Alert.alert('Print Error', 'Could not get printer instance.');
            return;
        }

        await ReactNativePosPrinter.printImage(base64, { align: 'CENTER', width: 200, height: 200 });
        await ReactNativePosPrinter.printText('COFFEE CLUB GO', { align: 'CENTER', size: 14, bold: true, fontType: 'A' });
        await ReactNativePosPrinter.printText('*** ORDER RECEIPT ***', { align: 'CENTER', size: 13, fontType: 'B' });
        await ReactNativePosPrinter.printText('='.repeat(32));

        await ReactNativePosPrinter.printText(`ORDER ID: ${order.order_id || order.id}`);
        await ReactNativePosPrinter.printText(`Date: ${formatDateWithOrdinal(new Date(order.created_at || Date.now()))}`);

        if (order.customer) {
            await ReactNativePosPrinter.printText(`CUSTOMER: ${order.customer.name}`);
        }

        if (order.order_type === 'TAKEAWAY') {
            await ReactNativePosPrinter.printText('TABLE(S): TAKEAWAY');
        } else if (order.tables && order.tables.length > 0) {
            const tableNumbers = order.tables.map(t => t.number).join(', ');
            await ReactNativePosPrinter.printText(`TABLE(S): ${tableNumbers}`);
        }

        await ReactNativePosPrinter.printText('-'.repeat(32));
        await ReactNativePosPrinter.printText('*** ITEMS ***');

        for (let i = 0; i < order.order_items.length; i++) {
            const item = order.order_items[i];
            await ReactNativePosPrinter.printText(`>> ${item.quantity}x ${item.item?.name || 'Item'} ${item.item_variation ? `(${item.item_variation.name})` : ''}`);
            await ReactNativePosPrinter.printText(`    ${CURRENCY_SYMBOL}${formatAmount(item.unit_price)} x ${item.quantity} = ${CURRENCY_SYMBOL}${formatAmount(item.total_price)}`);
            if (i !== order.order_items.length - 1) await ReactNativePosPrinter.newLine();
        }

        await ReactNativePosPrinter.printText('-'.repeat(32));

        // Subtotal with emphasis
        const subtotal = order.order_items.reduce((sum, item) =>
            sum + (Number(item.total_price) || 0), 0
        );
        await ReactNativePosPrinter.printText(`Subtotal: ${CURRENCY_SYMBOL}${formatAmount(subtotal)}`);
        if (order.discount_amount > 0) {
            await ReactNativePosPrinter.printText(`Discount: -${CURRENCY_SYMBOL}${formatAmount(order.discount_amount)}`);
        }

        // Points redemption (difference between subtotal-discount and total)
        const expectedTotal = subtotal - (order.discount_amount || 0);
        const pointsRedeemed = expectedTotal - order.total_amount;
        if (pointsRedeemed > 0) {
            await ReactNativePosPrinter.printText(`Points Redeemed: -${CURRENCY_SYMBOL}${formatAmount(pointsRedeemed)}`);
        }

        // Total with emphasis
        await ReactNativePosPrinter.printText(`*** TOTAL: ${CURRENCY_SYMBOL}${formatAmount(order.total_amount)} ***`, { bold: true, fontType: 'C' });
        await ReactNativePosPrinter.printText(`Payment: ${order.payment_method || 'Not Set'}`);

        // Points summary section for customers (uses backend data directly)
        if (order.customer && order.customer.points !== undefined) {
            await ReactNativePosPrinter.printText('-'.repeat(32));
            await ReactNativePosPrinter.printText('*** LOYALTY POINTS ***');
            await ReactNativePosPrinter.printText(`Total Points: ${Number(order.customer.points).toFixed(0)}`);
            await ReactNativePosPrinter.printText(`Balance: ${CURRENCY_SYMBOL}${formatAmount(order.customer.balance)}`);
        }

        // Footer
        await ReactNativePosPrinter.printText('-'.repeat(32));
        await ReactNativePosPrinter.printQRCode('https://www.facebook.com/people/Coffee-Club/100093935482813/', { size: 5, align: 'CENTER' });
        await ReactNativePosPrinter.printText('+88 01895 440225', { align: 'CENTER', size: 13 });
        await ReactNativePosPrinter.printText('-'.repeat(32));
        await ReactNativePosPrinter.printText('** Thank you for your visit! **', { align: 'CENTER', size: 9, italic: true, fontType: 'C' });
        await ReactNativePosPrinter.printText(`Printed: ${new Date().toLocaleString()}`, { align: 'CENTER', size: 9, fontType: 'C' });

        await ReactNativePosPrinter.newLine();
        await ReactNativePosPrinter.feedLine();
        await ReactNativePosPrinter.feedLine();
        await ReactNativePosPrinter.disconnectPrinter();
    }catch(error){
        console.error("Error printing receipt:", error);
    }
};

export const printKitchenToken = async (order: Order): Promise<void> => printToken(order, 'kitchen');
export const printBarToken = async (order: Order): Promise<void> => printToken(order, 'bar');

export const printSalesReport = async (report: any, printerAddress?: string): Promise<void> => {
    const ReactNativePosPrinter = getPrinter();
    if (!ReactNativePosPrinter) { showPrinterUnavailable(); return; }

    const printer = printerAddress || await selectedPrinter();
    try {
        const printerInstance = await ReactNativePosPrinter.connectPrinter(printer);
        if (!printerInstance) {
            Alert.alert('Print Error', 'Could not get printer instance.');
            return;
        }

        // Header
        await ReactNativePosPrinter.printText('COFFEE CLUB GO', { align: 'CENTER', size: 14, bold: true, fontType: 'A' });
        await ReactNativePosPrinter.printText('*** SALES REPORT ***', { align: 'CENTER', size: 13, fontType: 'B' });
        await ReactNativePosPrinter.printText('='.repeat(32));

        // Date & Type
        await ReactNativePosPrinter.printText(`Report Date: ${formatPrettyDateOnly(report.report_date)}`);
        await ReactNativePosPrinter.printText(`Created: ${new Date(report.created_at).toLocaleString()}`);
        await ReactNativePosPrinter.printText(`Type: ${report.is_auto_generated ? 'Auto' : 'Manual'}`);
        await ReactNativePosPrinter.printText('-'.repeat(32));

        // Main Stats
        await ReactNativePosPrinter.printText(`Total Sales: ${CURRENCY_SYMBOL}${formatAmount(report.total_sales)}`);
        await ReactNativePosPrinter.printText(`Total Orders: ${report.total_orders}`);
        await ReactNativePosPrinter.printText(`Bar Sales: ${CURRENCY_SYMBOL}${formatAmount(report.bar_sales)}`);
        await ReactNativePosPrinter.printText(`Bar Orders: ${report.bar_orders}`);
        await ReactNativePosPrinter.printText(`Kitchen Sales: ${CURRENCY_SYMBOL}${formatAmount(report.kitchen_sales)}`);
        await ReactNativePosPrinter.printText(`Kitchen Orders: ${report.kitchen_orders}`);
        await ReactNativePosPrinter.printText('-'.repeat(32));
        await ReactNativePosPrinter.printText(`Total Expenses: ${CURRENCY_SYMBOL}${formatAmount(report.total_expenses)}`);
        await ReactNativePosPrinter.printText(`Credit Amount: ${CURRENCY_SYMBOL}${formatAmount(report.credit_amount)}`, { bold: true });
        await ReactNativePosPrinter.printText('-'.repeat(32));

        // Footer
        await ReactNativePosPrinter.printText('Printed by Coffee Club Go', { align: 'CENTER', size: 9, fontType: 'C' });
        await ReactNativePosPrinter.printText(`Printed: ${new Date().toLocaleString()}`, { align: 'CENTER', size: 9, fontType: 'C' });

        await ReactNativePosPrinter.newLine();
        await ReactNativePosPrinter.feedLine();
        await ReactNativePosPrinter.feedLine();
        await ReactNativePosPrinter.disconnectPrinter();
    } catch (error) {
        console.error("Error printing sales report:", error);
    }
};
