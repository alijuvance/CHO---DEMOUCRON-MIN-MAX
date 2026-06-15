const http = require('http');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = (method, path, body) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseBody));
          } catch (e) {
            resolve(responseBody);
          }
        } else {
          reject(new Error("Request failed with status " + res.statusCode + ": " + responseBody));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(data);
    }
    req.end();
  });
};

async function seed() {
  console.log('Waiting for backend to start...');
  let isUp = false;
  for (let i = 0; i < 20; i++) {
    try {
      await request('GET', '/api/projects');
      isUp = true;
      break;
    } catch (e) {
      await delay(1000);
    }
  }

  if (!isUp) {
    console.error('Backend did not start in time.');
    return;
  }

  console.log('Backend is up. Seeding reference project...');

  try {
    // Check if project exists
    const existing = await request('GET', '/api/projects');
    if (existing && existing.length > 0) {
      console.log('Database already seeded.');
      return;
    }

    // Create Project
    const project = await request('POST', '/api/projects', { name: 'Projet de Référence', description: 'Graphe avec chemin critique A->C->E->F' });
    const projectId = project.id;
    console.log('Created project:', projectId);

    // Create Tasks
    const tA = await request('POST', '/api/tasks', { name: 'A', duration: 3, projectId });
    const tB = await request('POST', '/api/tasks', { name: 'B', duration: 2, projectId });
    const tC = await request('POST', '/api/tasks', { name: 'C', duration: 4, projectId });
    const tD = await request('POST', '/api/tasks', { name: 'D', duration: 1, projectId });
    const tE = await request('POST', '/api/tasks', { name: 'E', duration: 3, projectId });
    const tF = await request('POST', '/api/tasks', { name: 'F', duration: 2, projectId });
    console.log('Created tasks.');

    // Create Dependencies
    await request('POST', '/api/dependencies', { sourceTaskId: tA.id, targetTaskId: tB.id, projectId });
    await request('POST', '/api/dependencies', { sourceTaskId: tA.id, targetTaskId: tC.id, projectId });
    await request('POST', '/api/dependencies', { sourceTaskId: tB.id, targetTaskId: tD.id, projectId });
    await request('POST', '/api/dependencies', { sourceTaskId: tB.id, targetTaskId: tE.id, projectId });
    await request('POST', '/api/dependencies', { sourceTaskId: tC.id, targetTaskId: tE.id, projectId });
    await request('POST', '/api/dependencies', { sourceTaskId: tD.id, targetTaskId: tF.id, projectId });
    await request('POST', '/api/dependencies', { sourceTaskId: tE.id, targetTaskId: tF.id, projectId });
    console.log('Created dependencies.');

    // Trigger Analysis
    console.log('Running Demoucron and Min-Max analysis...');
    await request('POST', '/api/analysis/' + projectId + '/run');

    console.log('Seeding and analysis completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error.message);
  }
}

seed();
