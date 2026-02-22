import prisma from '../config/database';

export const createAuditLog = async (data: any) => {
  await prisma.auditLog.create({
    data: {
      ...data,
      changes: data.changes ? JSON.stringify(data.changes) : null,
    },
  });
};
