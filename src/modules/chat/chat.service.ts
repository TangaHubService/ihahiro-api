import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { paginate } from '@/common/types/paginated-result'
import { ChatMessage } from './entities/chat-message.entity'
import { ChatThread } from './entities/chat-thread.entity'
import { CreateThreadDto } from './dto/create-thread.dto'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatThread) private readonly threadsRepository: Repository<ChatThread>,
    @InjectRepository(ChatMessage) private readonly messagesRepository: Repository<ChatMessage>
  ) {}

  async createOrFindThread(dto: CreateThreadDto, requesterId: string): Promise<ChatThread> {
    if (dto.recipientId === requesterId) {
      throw new BadRequestException('You cannot start a conversation with yourself')
    }

    const existing = await this.threadsRepository.findOne({
      where: { buyerId: requesterId, sellerId: dto.recipientId, listingId: dto.listingId ?? IsNull() },
    })
    if (existing) return existing

    const thread = this.threadsRepository.create({
      buyerId: requesterId,
      sellerId: dto.recipientId,
      listingId: dto.listingId ?? null,
    })
    return this.threadsRepository.save(thread)
  }

  async listThreads(userId: string) {
    const threads = await this.threadsRepository.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      relations: { buyer: true, seller: true, listing: true },
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    })

    return threads.map((thread) => {
      const otherUser = thread.buyerId === userId ? thread.seller : thread.buyer
      return {
        id: thread.id,
        listing: thread.listing ? { id: thread.listing.id, title: thread.listing.title } : null,
        otherUser: otherUser
          ? { id: otherUser.id, firstName: otherUser.firstName, lastName: otherUser.lastName }
          : null,
        lastMessageAt: thread.lastMessageAt,
        createdAt: thread.createdAt,
      }
    })
  }

  async listMessages(threadId: string, requesterId: string, page: number, limit: number) {
    await this.getParticipantThread(threadId, requesterId)

    const [items, total] = await this.messagesRepository.findAndCount({
      where: { threadId },
      relations: { sender: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return paginate(
      items
        .map((m) => ({
          id: m.id,
          body: m.body,
          senderId: m.senderId,
          readAt: m.readAt,
          createdAt: m.createdAt,
        }))
        .reverse(),
      total,
      page,
      limit
    )
  }

  async sendMessage(threadId: string, requesterId: string, body: string): Promise<ChatMessage> {
    await this.getParticipantThread(threadId, requesterId)

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({ threadId, senderId: requesterId, body })
    )

    await this.threadsRepository.update({ id: threadId }, { lastMessageAt: message.createdAt })
    return message
  }

  async markRead(threadId: string, requesterId: string): Promise<void> {
    await this.getParticipantThread(threadId, requesterId)
    await this.messagesRepository
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ readAt: new Date() })
      .where('threadId = :threadId', { threadId })
      .andWhere('senderId != :requesterId', { requesterId })
      .andWhere('readAt IS NULL')
      .execute()
  }

  private async getParticipantThread(threadId: string, userId: string): Promise<ChatThread> {
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } })
    if (!thread) throw new NotFoundException('Conversation not found')
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new ForbiddenException('You are not part of this conversation')
    }
    return thread
  }
}
