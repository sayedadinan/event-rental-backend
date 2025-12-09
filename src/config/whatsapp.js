const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.enabled = process.env.WHATSAPP_ENABLED === 'true';
        this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    }

    async sendInvoice(customerPhone, invoiceDetails) {
        if (!this.enabled) {
            console.log('WhatsApp is disabled. Invoice message:', invoiceDetails);
            return { success: true, message: 'WhatsApp disabled - message logged' };
        }

        try {
            // Format phone number (remove any spaces, dashes, etc.)
            const formattedPhone = customerPhone.replace(/\D/g, '');

            // Create invoice message
            const message = this.formatInvoiceMessage(invoiceDetails);

            const response = await axios.post(
                this.apiUrl,
                {
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'text',
                    text: { body: message }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return { success: true, data: response.data };
        } catch (error) {
            console.error('WhatsApp send error:', error.response?.data || error.message);
            return { success: false, error: error.message };
        }
    }

    formatInvoiceMessage(details) {
        const { bookingId, customerName, items, totalAmount, bookingDate, returnDate } = details;

        let message = `🎉 *Booking Confirmation*\n\n`;
        message += `Hello ${customerName}!\n\n`;
        message += `📋 Booking ID: ${bookingId}\n`;
        message += `📅 Booking Date: ${new Date(bookingDate).toLocaleDateString()}\n`;
        message += `📅 Return Date: ${new Date(returnDate).toLocaleDateString()}\n\n`;
        message += `*Items Rented:*\n`;

        items.forEach((item, index) => {
            message += `${index + 1}. ${item.productName} x ${item.quantity} - ₹${item.itemTotal}\n`;
        });

        message += `\n💰 *Total Amount: ₹${totalAmount}*\n\n`;
        message += `Thank you for your business! 🙏`;

        return message;
    }
}

module.exports = new WhatsAppService();
