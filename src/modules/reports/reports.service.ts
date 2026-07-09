import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { paginate } from '@/common/types/paginated-result'
import { Listing } from '@/modules/listings/entities/listing.entity'
import { CreateReportDto } from './dto/create-report.dto'
import { ResolveReportDto } from './dto/resolve-report.dto'
import { Report, ReportStatus } from './entities/report.entity'

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportsRepository: Repository<Report>,
    @InjectRepository(Listing) private readonly listingsRepository: Repository<Listing>
  ) {}

  async create(dto: CreateReportDto, reporterId: string): Promise<Report> {
    const listing = await this.listingsRepository.findOne({ where: { id: dto.listingId } })
    if (!listing) throw new NotFoundException('Listing not found')

    const report = this.reportsRepository.create({
      listingId: dto.listingId,
      reporterId,
      reason: dto.reason,
      message: dto.message ?? null,
    })

    return this.reportsRepository.save(report)
  }

  async findPending(page: number, limit: number) {
    const [items, total] = await this.reportsRepository.findAndCount({
      where: { status: ReportStatus.PENDING },
      relations: { listing: true, reporter: true },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return paginate(
      items.map((r) => ({
        id: r.id,
        reason: r.reason,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
        listing: r.listing ? { id: r.listing.id, title: r.listing.title } : null,
        reporter: r.reporter
          ? { id: r.reporter.id, firstName: r.reporter.firstName, lastName: r.reporter.lastName }
          : null,
      })),
      total,
      page,
      limit
    )
  }

  async resolve(id: string, dto: ResolveReportDto, resolvedById: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({ where: { id } })
    if (!report) throw new NotFoundException('Report not found')

    report.status = dto.status
    report.resolvedById = resolvedById
    report.resolvedAt = new Date()

    return this.reportsRepository.save(report)
  }
}
