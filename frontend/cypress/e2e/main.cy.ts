// Cypress E2E Test - Login Flow
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Iniciar Sesión').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.contains('button', 'Iniciar Sesión').click();
    cy.contains('Email requerido').should('be.visible');
    cy.contains('Contraseña requerida').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Iniciar Sesión').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.contains('button', 'Iniciar Sesión').click();

    cy.contains('Credenciales inválidas').should('be.visible');
  });
});

// Cypress E2E Test - Search Flow
describe('Search Professionals', () => {
  beforeEach(() => {
    cy.visit('/buscar');
  });

  it('should display search interface', () => {
    cy.get('input[placeholder*="Buscar"]').should('be.visible');
    cy.contains('Filtros').should('be.visible');
  });

  it('should search by profession', () => {
    cy.get('select[name="oficio"]').select('Plomero');
    cy.contains('button', 'Buscar').click();

    cy.get('[data-testid="professional-card"]').should('have.length.greaterThan', 0);
  });

  it('should filter by location', () => {
    cy.get('input[name="ubicacion"]').type('Buenos Aires');
    cy.get('input[name="radio_km"]').clear().type('10');
    cy.contains('button', 'Buscar').click();

    cy.wait(2000);
    cy.get('[data-testid="professional-card"]').should('exist');
  });

  it('should open professional profile', () => {
    cy.get('[data-testid="professional-card"]').first().click();
    cy.url().should('include', '/profesional/');
    cy.contains('Perfil del Profesional').should('be.visible');
  });
});

// Cypress E2E Test - Chat Flow
describe('Chat System', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Iniciar Sesión').click();
    cy.wait(1000);
  });

  it('should display chat list', () => {
    cy.visit('/mensajes');
    cy.contains('Mensajes').should('be.visible');
  });

  it('should send a message', () => {
    cy.visit('/mensajes');
    cy.get('[data-testid="chat-item"]').first().click();

    const message = 'Test message ' + Date.now();
    cy.get('input[placeholder*="mensaje"]').type(message);
    cy.get('button[type="submit"]').click();

    cy.contains(message).should('be.visible');
  });

  it('should send an offer', () => {
    cy.visit('/mensajes');
    cy.get('[data-testid="chat-item"]').first().click();

    cy.contains('Enviar Oferta').click();
    cy.get('textarea[name="descripcion"]').type('Trabajo de prueba');
    cy.get('input[name="precio"]').type('5000');
    cy.contains('button', 'Enviar Oferta').click();

    cy.contains('Oferta enviada').should('be.visible');
  });
});

// Cypress E2E Test - Review Flow
describe('Review System', () => {
  beforeEach(() => {
    // Login and navigate to a completed job
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Iniciar Sesión').click();
    cy.wait(1000);
  });

  it('should create a review', () => {
    cy.visit('/trabajos');
    cy.get('[data-testid="trabajo-completado"]').first().click();
    cy.contains('Dejar Reseña').click();

    // Select rating
    cy.get('[data-testid="star-5"]').click();

    // Write comment
    cy.get('textarea[name="comentario"]').type('Excelente servicio, muy profesional y puntual');

    // Recommend
    cy.get('input[name="recomendaria"]').check();

    cy.contains('button', 'Publicar Reseña').click();

    cy.contains('Reseña publicada').should('be.visible');
  });
});

// Cypress E2E Test - Payment Flow
describe('Payment Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Iniciar Sesión').click();
    cy.wait(1000);
  });

  it('should initiate payment', () => {
    cy.visit('/trabajos');
    cy.get('[data-testid="trabajo-aceptado"]').first().click();
    cy.contains('Pagar Servicio').click();

    cy.get('[data-testid="payment-summary"]').should('be.visible');
    cy.contains('MercadoPago').should('be.visible');
  });

  it('should accept terms and proceed', () => {
    cy.visit('/pagos/checkout/123');
    cy.get('input[type="checkbox"][name="acepta_terminos"]').check();
    cy.contains('button', 'Proceder al Pago').should('not.be.disabled');
  });
});
