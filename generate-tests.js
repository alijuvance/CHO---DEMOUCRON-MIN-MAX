const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'backend', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
};

write('src/analysis/engine/demoucron.engine.spec.ts', `
import { DemoucronEngine } from './demoucron.engine';
import { Task } from '../../task/task.entity';
import { Dependency } from '../../dependency/dependency.entity';

describe('DemoucronEngine', () => {
  it('should throw an error if a cycle is detected', () => {
    const tasks = [
      { id: 1, duration: 1 } as Task,
      { id: 2, duration: 1 } as Task,
      { id: 3, duration: 1 } as Task,
    ];
    const deps = [
      { sourceTaskId: 1, targetTaskId: 2 } as Dependency,
      { sourceTaskId: 2, targetTaskId: 3 } as Dependency,
      { sourceTaskId: 3, targetTaskId: 1 } as Dependency,
    ];

    expect(() => DemoucronEngine.run(tasks, deps)).toThrow('Le graphe contient un cycle. Ordonnancement impossible.');
  });

  it('should correctly process the reference 6-task example', () => {
    const tasks = [
      { id: 1, name: 'A', duration: 3 } as Task,
      { id: 2, name: 'B', duration: 2 } as Task,
      { id: 3, name: 'C', duration: 4 } as Task,
      { id: 4, name: 'D', duration: 1 } as Task,
      { id: 5, name: 'E', duration: 3 } as Task,
      { id: 6, name: 'F', duration: 2 } as Task,
    ];

    const deps = [
      { sourceTaskId: 1, targetTaskId: 2 } as Dependency,
      { sourceTaskId: 1, targetTaskId: 3 } as Dependency,
      { sourceTaskId: 2, targetTaskId: 4 } as Dependency,
      { sourceTaskId: 2, targetTaskId: 5 } as Dependency,
      { sourceTaskId: 3, targetTaskId: 5 } as Dependency,
      { sourceTaskId: 4, targetTaskId: 6 } as Dependency,
      { sourceTaskId: 5, targetTaskId: 6 } as Dependency,
    ];

    const result = DemoucronEngine.run(tasks, deps);

    // Assert Critical Path
    const criticalPath = result.filter(t => t.isCritical).map(t => t.name).join('->');
    expect(criticalPath).toBe('A->C->E->F');

    // Assert specific task dates (Task F)
    const taskF = result.find(t => t.name === 'F');
    expect(taskF?.earliestStart).toBe(10);
    expect(taskF?.earliestFinish).toBe(12);
    expect(taskF?.latestStart).toBe(10);
    expect(taskF?.latestFinish).toBe(12);
    expect(taskF?.totalMargin).toBe(0);

    // Assert non-critical task (Task B)
    const taskB = result.find(t => t.name === 'B');
    expect(taskB?.earliestStart).toBe(3);
    expect(taskB?.earliestFinish).toBe(5);
    expect(taskB?.latestStart).toBe(5);
    expect(taskB?.latestFinish).toBe(7);
    expect(taskB?.totalMargin).toBe(2);
  });
});
`);

write('test/analysis.e2e-spec.ts', `
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// For E2E tests, the app uses TypeORM with SQLite or Postgres. 
// Since we are validating structure, we will just ensure the module mounts correctly.
describe('Analysis API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/projects (GET) should be available', () => {
    return request(app.getHttpServer())
      .get('/projects')
      .expect(200);
  });
});
`);

console.log("Tests generated successfully!");
