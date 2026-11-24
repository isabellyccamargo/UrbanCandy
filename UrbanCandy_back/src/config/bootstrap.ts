import { setupAssociations } from '../models/Associations.js';
import '../models/PaymentAttempt.js';
import '../models/OrderStatusOutbox.js';

export function initializeDatabase() {
  setupAssociations();
}
