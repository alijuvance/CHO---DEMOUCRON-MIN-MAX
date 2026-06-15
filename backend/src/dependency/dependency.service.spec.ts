import { Test, TestingModule } from '@nestjs/testing';
import { DependencyService } from './dependency.service';

describe('DependencyService', () => {
  let service: DependencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DependencyService],
    }).compile();

    service = module.get<DependencyService>(DependencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
