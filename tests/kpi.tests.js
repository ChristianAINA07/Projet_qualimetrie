const express = require('express');
const request = require('supertest');
const { calculateKPI } = require('../src/controllers/kpiController');

const app = express();
app.use(express.json());
app.post('/api/calculate-kpi', calculateKPI);

describe('SmartAnalytics KPI - Tests', () => {

  // ===== TESTS CROISSANCE =====
  
  test('Statut Excellent si croissance > 20%', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 125000,
        oldRevenue: 100000,
        churnRate: 0.02,
        isStartup: false,
        views: 500000
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.growth).toBe(0.25);
    expect(res.body.status).toBe('Excellent');
  });

  test('Statut Critique si croissance < 0%', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 12,
        oldRevenue: 100,
        churnRate: 0.6,
        isStartup: false,
        views: 1
      });
    
    expect(res.body.growth).toBe(-0.88);
    expect(res.body.status).toBe('Critique');
  });

  test('Statut Normal si croissance entre 0% et 20%', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 110000,
        oldRevenue: 100000,
        churnRate: 0.02,
        isStartup: false,
        views: 500000
      });
    
    expect(res.body.growth).toBe(0.10);
    expect(res.body.status).toBe('Normal');
  });

  test('Statut No Data si oldRevenue = 0', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 50000,
        oldRevenue: 0,
        churnRate: 0.02,
        isStartup: false,
        views: 500000
      });
    
    expect(res.body.growth).toBe(0);
    expect(res.body.status).toBe('No Data');
  });

  // ===== TESTS CHURN =====
  
  test('Réduction 10% si churn > 5% ET mode Entreprise', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.06,
        isStartup: false,
        views: 500000
      });
    
    expect(res.body.projectedRevenue).toBe(90000);
  });

  test('PAS de réduction churn si mode Startup', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.08,
        isStartup: true,
        views: 500000
      });
    
    expect(res.body.projectedRevenue).toBe(100000);
  });

  test('PAS de réduction si churn <= 5%', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.05,
        isStartup: false,
        views: 500000
      });
    
    expect(res.body.projectedRevenue).toBe(100000);
  });

  // ===== TESTS VUES =====
  
  test('Déduction 500€ si vues > 1 million', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.02,
        isStartup: false,
        views: 1500000
      });
    
    expect(res.body.projectedRevenue).toBe(99500);
  });

  test('Revenu = 0 si vues > 1M ET revenu <= 500', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 400,
        oldRevenue: 400,
        churnRate: 0.02,
        isStartup: false,
        views: 2000000
      });
    
    expect(res.body.projectedRevenue).toBe(0);
  });

  test('PAS de déduction si vues <= 1 million', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.02,
        isStartup: false,
        views: 999999
      });
    
    expect(res.body.projectedRevenue).toBe(100000);
  });

  // ===== TESTS COMBINÉS =====
  
  test('Startup + Churn élevé + Vues > 1M', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.10,
        isStartup: true,
        views: 1200000
      });
    
    // Pas de réduction churn (startup) mais -500€ pour vues
    expect(res.body.projectedRevenue).toBe(99500);
  });

  test('Entreprise + Churn élevé + Vues > 1M', async () => {
    const res = await request(app)
      .post('/api/calculate-kpi')
      .send({
        newRevenue: 100000,
        oldRevenue: 100000,
        churnRate: 0.10,
        isStartup: false,
        views: 1200000
      });
    
    // -10% churn puis -500€ vues
    expect(res.body.projectedRevenue).toBe(89500);
  });

});