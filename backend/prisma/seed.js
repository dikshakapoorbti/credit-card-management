const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed data for Credit Card Recommendation System
 * Based on Section 15 of database.md - HDFC Credit Card Data
 */

async function main() {
  console.log('Starting database seed...');

  // ==================== CATEGORIES ====================
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Fuel' },
      update: {},
      create: { name: 'Fuel', icon: 'fuel' }
    }),
    prisma.category.upsert({
      where: { name: 'Grocery' },
      update: {},
      create: { name: 'Grocery', icon: 'shopping-cart' }
    }),
    prisma.category.upsert({
      where: { name: 'Travel' },
      update: {},
      create: { name: 'Travel', icon: 'plane' }
    }),
    prisma.category.upsert({
      where: { name: 'Dining' },
      update: {},
      create: { name: 'Dining', icon: 'utensils' }
    }),
    prisma.category.upsert({
      where: { name: 'Online Shopping' },
      update: {},
      create: { name: 'Online Shopping', icon: 'shopping-bag' }
    }),
    prisma.category.upsert({
      where: { name: 'Entertainment' },
      update: {},
      create: { name: 'Entertainment', icon: 'film' }
    }),
    prisma.category.upsert({
      where: { name: 'Utility Bills' },
      update: {},
      create: { name: 'Utility Bills', icon: 'file-invoice' }
    }),
    prisma.category.upsert({
      where: { name: 'Insurance' },
      update: {},
      create: { name: 'Insurance', icon: 'shield' }
    }),
    prisma.category.upsert({
      where: { name: 'Education' },
      update: {},
      create: { name: 'Education', icon: 'graduation-cap' }
    }),
    prisma.category.upsert({
      where: { name: 'Healthcare' },
      update: {},
      create: { name: 'Healthcare', icon: 'heartbeat' }
    }),
    prisma.category.upsert({
      where: { name: 'Food Delivery' },
      update: {},
      create: { name: 'Food Delivery', icon: 'motorcycle' }
    }),
    prisma.category.upsert({
      where: { name: 'Others' },
      update: {},
      create: { name: 'Others', icon: 'ellipsis-h' }
    })
  ]);

  const categoryMap = Object.fromEntries(categories.map(c => [c.name, c.id]));
  console.log(`Created ${categories.length} categories`);

  // ==================== BANKS ====================
  console.log('Creating banks...');
  const hdfcBank = await prisma.bank.upsert({
    where: { name: 'HDFC Bank' },
    update: {},
    create: {
      name: 'HDFC Bank',
      logoUrl: '/logos/hdfc.png',
      apiIdentifier: 'HDFC'
    }
  });

  const iciciBank = await prisma.bank.upsert({
    where: { name: 'ICICI Bank' },
    update: {},
    create: {
      name: 'ICICI Bank',
      logoUrl: '/logos/icici.png',
      apiIdentifier: 'ICICI'
    }
  });

  const sbiBank = await prisma.bank.upsert({
    where: { name: 'SBI Card' },
    update: {},
    create: {
      name: 'SBI Card',
      logoUrl: '/logos/sbi.png',
      apiIdentifier: 'SBI'
    }
  });

  const axisBank = await prisma.bank.upsert({
    where: { name: 'Axis Bank' },
    update: {},
    create: {
      name: 'Axis Bank',
      logoUrl: '/logos/axis.png',
      apiIdentifier: 'AXIS'
    }
  });

  console.log('Created 4 banks');

  // ==================== HDFC CREDIT CARDS ====================
  console.log('Creating HDFC credit cards...');

  const infiniaCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: hdfcBank.id, cardName: 'Infinia' } },
    update: {},
    create: {
      bankId: hdfcBank.id,
      cardName: 'Infinia',
      cardNetwork: 'Visa',
      annualFee: 12500,
      feeWaiverSpend: 1000000,
      active: true
    }
  });

  const regaliaGoldCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: hdfcBank.id, cardName: 'Regalia Gold' } },
    update: {},
    create: {
      bankId: hdfcBank.id,
      cardName: 'Regalia Gold',
      cardNetwork: 'Visa',
      annualFee: 2500,
      feeWaiverSpend: 400000,
      active: true
    }
  });

  const millenniaCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: hdfcBank.id, cardName: 'Millennia' } },
    update: {},
    create: {
      bankId: hdfcBank.id,
      cardName: 'Millennia',
      cardNetwork: 'Mastercard',
      annualFee: 1000,
      feeWaiverSpend: 100000,
      active: true
    }
  });

  const swiggyCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: hdfcBank.id, cardName: 'Swiggy HDFC Bank Credit Card' } },
    update: {},
    create: {
      bankId: hdfcBank.id,
      cardName: 'Swiggy HDFC Bank Credit Card',
      cardNetwork: 'Mastercard',
      annualFee: 500,
      feeWaiverSpend: 200000,
      active: true
    }
  });

  const dinersBlackCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: hdfcBank.id, cardName: 'Diners Club Black' } },
    update: {},
    create: {
      bankId: hdfcBank.id,
      cardName: 'Diners Club Black',
      cardNetwork: 'Diners',
      annualFee: 10000,
      feeWaiverSpend: 500000,
      active: true
    }
  });

  console.log('Created 5 HDFC cards');

  // ==================== OTHER BANK CARDS ====================
  console.log('Creating other bank cards...');

  const amazonPayCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: iciciBank.id, cardName: 'Amazon Pay ICICI Credit Card' } },
    update: {},
    create: {
      bankId: iciciBank.id,
      cardName: 'Amazon Pay ICICI Credit Card',
      cardNetwork: 'Visa',
      annualFee: 0,
      feeWaiverSpend: null,
      active: true
    }
  });

  const flipkartAxisCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: axisBank.id, cardName: 'Flipkart Axis Bank Credit Card' } },
    update: {},
    create: {
      bankId: axisBank.id,
      cardName: 'Flipkart Axis Bank Credit Card',
      cardNetwork: 'Visa',
      annualFee: 500,
      feeWaiverSpend: 200000,
      active: true
    }
  });

  const sbiCashbackCard = await prisma.creditCard.upsert({
    where: { bankId_cardName: { bankId: sbiBank.id, cardName: 'SBI Cashback Credit Card' } },
    update: {},
    create: {
      bankId: sbiBank.id,
      cardName: 'SBI Cashback Credit Card',
      cardNetwork: 'Visa',
      annualFee: 999,
      feeWaiverSpend: 200000,
      active: true
    }
  });

  console.log('Created 3 other bank cards');

  // ==================== CASHBACK RULES ====================
  console.log('Creating cashback rules...');

  // HDFC Millennia - Fuel surcharge waiver (from database.md Section 15.4)
  await prisma.cardCashbackRule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      cardId: millenniaCard.id,
      categoryId: categoryMap['Fuel'],
      rewardType: 'waiver',
      cashbackPercent: 1.0,
      minTxnAmount: 400,
      maxTxnAmount: 5000,
      maxCashback: 250,
      rewardCycle: 'statement',
      active: true
    }
  });

  // HDFC Millennia - Online shopping
  await prisma.cardCashbackRule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      cardId: millenniaCard.id,
      categoryId: categoryMap['Online Shopping'],
      rewardType: 'cashback',
      cashbackPercent: 2.5,
      maxCashback: 750,
      rewardCycle: 'statement',
      active: true
    }
  });

  // HDFC Swiggy Card - Food Delivery
  await prisma.cardCashbackRule.upsert({
    where: { id: 3 },
    update: {},
    create: {
      cardId: swiggyCard.id,
      categoryId: categoryMap['Food Delivery'],
      rewardType: 'cashback',
      cashbackPercent: 10.0,
      maxCashback: 1500,
      rewardCycle: 'monthly',
      active: true
    }
  });

  // HDFC Swiggy Card - Dining
  await prisma.cardCashbackRule.upsert({
    where: { id: 4 },
    update: {},
    create: {
      cardId: swiggyCard.id,
      categoryId: categoryMap['Dining'],
      rewardType: 'cashback',
      cashbackPercent: 5.0,
      maxCashback: 500,
      rewardCycle: 'monthly',
      active: true
    }
  });

  // HDFC Infinia - Travel
  await prisma.cardCashbackRule.upsert({
    where: { id: 5 },
    update: {},
    create: {
      cardId: infiniaCard.id,
      categoryId: categoryMap['Travel'],
      rewardType: 'points',
      cashbackPercent: 3.3,
      maxCashback: null,
      rewardCycle: 'monthly',
      active: true
    }
  });

  // HDFC Diners Club Black - Dining
  await prisma.cardCashbackRule.upsert({
    where: { id: 6 },
    update: {},
    create: {
      cardId: dinersBlackCard.id,
      categoryId: categoryMap['Dining'],
      rewardType: 'points',
      cashbackPercent: 5.0,
      maxCashback: null,
      rewardCycle: 'monthly',
      active: true
    }
  });

  // Amazon Pay ICICI - Online Shopping
  await prisma.cardCashbackRule.upsert({
    where: { id: 7 },
    update: {},
    create: {
      cardId: amazonPayCard.id,
      categoryId: categoryMap['Online Shopping'],
      rewardType: 'cashback',
      cashbackPercent: 5.0,
      maxCashback: null, // No cap on Amazon
      rewardCycle: 'monthly',
      active: true
    }
  });

  // Amazon Pay ICICI - Others
  await prisma.cardCashbackRule.upsert({
    where: { id: 8 },
    update: {},
    create: {
      cardId: amazonPayCard.id,
      categoryId: categoryMap['Others'],
      rewardType: 'cashback',
      cashbackPercent: 1.0,
      maxCashback: null,
      rewardCycle: 'monthly',
      active: true
    }
  });

  // Flipkart Axis - Online Shopping
  await prisma.cardCashbackRule.upsert({
    where: { id: 9 },
    update: {},
    create: {
      cardId: flipkartAxisCard.id,
      categoryId: categoryMap['Online Shopping'],
      rewardType: 'cashback',
      cashbackPercent: 5.0,
      maxCashback: 500,
      rewardCycle: 'monthly',
      active: true
    }
  });

  // SBI Cashback - All categories
  await prisma.cardCashbackRule.upsert({
    where: { id: 10 },
    update: {},
    create: {
      cardId: sbiCashbackCard.id,
      categoryId: categoryMap['Online Shopping'],
      rewardType: 'cashback',
      cashbackPercent: 5.0,
      maxCashback: 5000,
      rewardCycle: 'quarterly',
      active: true
    }
  });

  console.log('Created 10 cashback rules');

  // ==================== EXCLUSIONS (from database.md Section 15.5) ====================
  console.log('Creating exclusions...');

  // Get the Millennia fuel rule
  const millenniaFuelRule = await prisma.cardCashbackRule.findFirst({
    where: {
      cardId: millenniaCard.id,
      categoryId: categoryMap['Fuel']
    }
  });

  if (millenniaFuelRule) {
    await prisma.cashbackExclusion.createMany({
      data: [
        { cashbackRuleId: millenniaFuelRule.id, exclusionType: 'Wallet Load' },
        { cashbackRuleId: millenniaFuelRule.id, exclusionType: 'Cash Withdrawal' },
        { cashbackRuleId: millenniaFuelRule.id, exclusionType: 'Balance Transfer' }
      ],
      skipDuplicates: true
    });
  }

  console.log('Created exclusions');

  // ==================== FEE RULES ====================
  console.log('Creating fee rules...');

  await prisma.cardFeeRule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      cardId: regaliaGoldCard.id,
      annualFee: 2500,
      joiningFee: 2500,
      feeWaiverSpend: 400000
    }
  });

  await prisma.cardFeeRule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      cardId: infiniaCard.id,
      annualFee: 12500,
      joiningFee: 12500,
      feeWaiverSpend: 1000000
    }
  });

  console.log('Created fee rules');

  // ==================== SAMPLE USER ====================
  console.log('Creating sample user...');

  const sampleUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '9876543210'
    }
  });

  // Add some cards to the sample user
  await prisma.userCard.upsert({
    where: { userId_cardId: { userId: sampleUser.id, cardId: millenniaCard.id } },
    update: {},
    create: {
      userId: sampleUser.id,
      cardId: millenniaCard.id,
      last4Digits: '4567',
      verified: true
    }
  });

  await prisma.userCard.upsert({
    where: { userId_cardId: { userId: sampleUser.id, cardId: amazonPayCard.id } },
    update: {},
    create: {
      userId: sampleUser.id,
      cardId: amazonPayCard.id,
      last4Digits: '8901',
      verified: true
    }
  });

  await prisma.userCard.upsert({
    where: { userId_cardId: { userId: sampleUser.id, cardId: swiggyCard.id } },
    update: {},
    create: {
      userId: sampleUser.id,
      cardId: swiggyCard.id,
      last4Digits: '2345',
      verified: true
    }
  });

  console.log('Created sample user with 3 cards');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\nSummary:');
  console.log(`- ${categories.length} categories`);
  console.log('- 4 banks');
  console.log('- 8 credit cards');
  console.log('- 10 cashback rules');
  console.log('- 1 sample user with 3 cards');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
