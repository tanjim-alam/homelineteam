// Adds a `deletedAt` field used to soft-delete documents into the Recycle Bin
// instead of removing them outright. Items with deletedAt === null are "live";
// non-null means they're in the bin, and the trash cleanup job purges them
// after RECYCLE_BIN_RETENTION_DAYS.
const RECYCLE_BIN_RETENTION_DAYS = 30;

function softDeletePlugin(schema) {
	schema.add({ deletedAt: { type: Date, default: null, index: true } });
}

// Merge into a query filter to exclude soft-deleted documents.
const notDeleted = { deletedAt: null };

module.exports = { softDeletePlugin, notDeleted, RECYCLE_BIN_RETENTION_DAYS };
