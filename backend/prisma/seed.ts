import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const hashPassword = async (password: string) => bcrypt.hash(password, 10);

async function seed() {
  console.log('Starting database seed...');

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Hospital',
      subdomain: 'demo',
      isGroup: false,
      plan: 'PRO',
    },
  });

  console.log('Created tenant:', tenant.name);

  const facility = await prisma.facility.create({
    data: {
      tenantId: tenant.id,
      name: 'Demo Hospital - Main Branch',
      address: 'Nairobi, Kenya',
      phone: '+254700000000',
      email: 'info@demo.medicore.co.ke',
    },
  });

  console.log('Created facility:', facility.name);

  const departments = await Promise.all([
    prisma.department.create({
      data: {
        facilityId: facility.id,
        name: 'Emergency',
        type: 'EMERGENCY',
      },
    }),
    prisma.department.create({
      data: {
        facilityId: facility.id,
        name: 'Outpatient',
        type: 'OUTPATIENT',
      },
    }),
    prisma.department.create({
      data: {
        facilityId: facility.id,
        name: 'Laboratory',
        type: 'LABORATORY',
      },
    }),
    prisma.department.create({
      data: {
        facilityId: facility.id,
        name: 'Pharmacy',
        type: 'PHARMACY',
      },
    }),
  ]);

  console.log('Created departments:', departments.length);

  const hashedPassword = await hashPassword('admin123');

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      facilityId: facility.id,
      email: 'admin@demo.medicore.co.ke',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000001',
      role: 'FACILITY_ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  const doctor = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      facilityId: facility.id,
      email: 'doctor@demo.medicore.co.ke',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+254700000002',
      role: 'OUTPATIENT_DOCTOR',
      departments: {
        create: {
          departmentId: departments[1].id,
        },
      },
    },
  });

  console.log('Created doctor user:', doctor.email);

  // Create inventory items
  const medications = [
    { name: 'Amoxicillin 500mg', generic: 'Amoxicillin', qty: 500 },
    { name: 'Paracetamol 500mg', generic: 'Acetaminophen', qty: 1000 },
    { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', qty: 300 },
    { name: 'Metformin 500mg', generic: 'Metformin', qty: 200 },
    { name: 'Amlodipine 5mg', generic: 'Amlodipine', qty: 150 },
    { name: 'Omeprazole 20mg', generic: 'Omeprazole', qty: 250 },
    { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', qty: 100 },
    { name: 'Azithromycin 250mg', generic: 'Azithromycin', qty: 80 },
  ];

  for (const med of medications) {
    const item = await prisma.inventoryItem.create({
      data: {
        facilityId: facility.id,
        itemName: med.name,
        genericName: med.generic,
        category: 'MEDICATION',
        unit: 'tablets',
        reorderLevel: 50,
      },
    });

    await prisma.stockLevel.create({
      data: {
        itemId: item.id,
        quantity: med.qty,
      },
    });
  }

  console.log('Created inventory items:', medications.length);

  // Create sample patients
  const patients = [
    { firstName: 'John', lastName: 'Kamau', nationalId: '12345678', dob: '1985-03-15', gender: 'MALE', phone: '+254712345678', allergies: 'Penicillin', chronic: 'Hypertension' },
    { firstName: 'Mary', lastName: 'Wanjiku', nationalId: '23456789', dob: '1990-07-22', gender: 'FEMALE', phone: '+254723456789', allergies: null, chronic: null },
    { firstName: 'Peter', lastName: 'Ochieng', nationalId: '34567890', dob: '1978-11-30', gender: 'MALE', phone: '+254734567890', allergies: 'Sulfa drugs', chronic: 'Diabetes Type 2' },
    { firstName: 'Grace', lastName: 'Akinyi', nationalId: '45678901', dob: '1995-05-18', gender: 'FEMALE', phone: '+254745678901', allergies: null, chronic: null },
    { firstName: 'David', lastName: 'Mwangi', nationalId: '56789012', dob: '1982-09-08', gender: 'MALE', phone: '+254756789012', allergies: 'Aspirin', chronic: 'Asthma' },
  ];

  for (const p of patients) {
    await prisma.patient.create({
      data: {
        tenantId: tenant.id,
        facilityId: facility.id,
        patientNumber: `P${Date.now()}${Math.floor(Math.random() * 1000)}`,
        nationalId: p.nationalId,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dob),
        gender: p.gender,
        phone: p.phone,
        allergies: p.allergies,
        chronicConditions: p.chronic,
      },
    });
  }

  console.log('Created sample patients:', patients.length);

  // Create sample appointments
  const today = new Date();
  const patient1 = await prisma.patient.findFirst();
  if (patient1) {
    await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor.id,
        departmentId: departments[1].id,
        appointmentDate: new Date(today.setHours(10, 0, 0, 0)),
        duration: 30,
        status: 'BOOKED',
        reason: 'Follow-up consultation',
      },
    });

    await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor.id,
        departmentId: departments[1].id,
        appointmentDate: new Date(today.setHours(14, 30, 0, 0)),
        duration: 30,
        status: 'BOOKED',
        reason: 'General checkup',
      },
    });
  }

  console.log('Created sample appointments');

  // Create sample beds
  const wards = ['ICU', 'General Ward', 'Maternity'];
  for (const ward of wards) {
    for (let i = 1; i <= 4; i++) {
      await prisma.bed.create({
        data: {
          facilityId: facility.id,
          wardName: ward,
          bedNumber: `${i}`,
          status: i === 1 ? 'OCCUPIED' : 'AVAILABLE',
        },
      });
    }
  }

  console.log('Created sample beds');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@demo.medicore.co.ke / admin123');
  console.log('Doctor: doctor@demo.medicore.co.ke / admin123');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
