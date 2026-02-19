import { Alert } from 'react-native';
import { base64 } from './printerUtil';

export const printAdvancedReceipt = async (selectedPrinter: string) => {
  let ReactNativePosPrinter: any;
  try {
    ReactNativePosPrinter = require('react-native-thermal-pos-printer').default;
  } catch {
    Alert.alert(
      'Printer Not Available',
      'Bluetooth printing requires a custom development build. It is not available in Expo Go.',
    );
    return;
  }

  try {
    const printerInstance = await ReactNativePosPrinter.connectPrinter(selectedPrinter);
    if (!printerInstance) {
      Alert.alert('Print Error', 'Could not get printer instance.');
      return;
    }
    await ReactNativePosPrinter.printImage(base64, { align: 'CENTER', width: 200, height: 200 });
    await ReactNativePosPrinter.printText('MY STORE', { align: 'CENTER', size: 26, bold: true, fontType: 'A' });
    await ReactNativePosPrinter.printText('123 Main St, City, State', { align: 'CENTER', size: 10 });
    await ReactNativePosPrinter.printText('Tel: (555) 123-4567', { align: 'CENTER', size: 12 });
    await ReactNativePosPrinter.printText('='.repeat(32));
    await ReactNativePosPrinter.printText('Item 1                    $10.00');
    await ReactNativePosPrinter.printText('Item 2                    $15.00');
    await ReactNativePosPrinter.printText('Tax                        $2.50');
    await ReactNativePosPrinter.printText('-'.repeat(32));
    await ReactNativePosPrinter.printText('Total             $27.50', { align: 'CENTER', size: 12, bold: true, fontType: 'A' });
    await ReactNativePosPrinter.printText('='.repeat(32));
    await ReactNativePosPrinter.printText('Thank you for shopping with us!', { align: 'CENTER', size: 8, italic: true });
    await ReactNativePosPrinter.printText('Visit again: www.mystore.com', { align: 'CENTER', size: 10 });
    await ReactNativePosPrinter.newLine();
    await ReactNativePosPrinter.feedLine();
    await ReactNativePosPrinter.feedLine();
    await ReactNativePosPrinter.disconnectPrinter();
    Alert.alert('Success', 'Printed successfully!');
  } catch (error) {
    console.error('Error printing receipt:', error);
  } finally {
    if (await ReactNativePosPrinter.isConnected()) { await ReactNativePosPrinter.disconnectPrinter(); }
  }
};
