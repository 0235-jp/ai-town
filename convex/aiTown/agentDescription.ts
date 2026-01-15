import { ObjectType, v } from 'convex/values';
import { GameId, agentId, parseGameId } from './ids';

export class AgentDescription {
  agentId: GameId<'agents'>;
  identity: string;
  plan: string;
  isNPC: boolean;

  constructor(serialized: SerializedAgentDescription) {
    const { agentId, identity, plan, isNPC } = serialized;
    this.agentId = parseGameId('agents', agentId);
    this.identity = identity;
    this.plan = plan;
    this.isNPC = isNPC ?? false;
  }

  serialize(): SerializedAgentDescription {
    const { agentId, identity, plan, isNPC } = this;
    return { agentId, identity, plan, isNPC };
  }
}

export const serializedAgentDescription = {
  agentId,
  identity: v.string(),
  plan: v.string(),
  isNPC: v.optional(v.boolean()),
};
export type SerializedAgentDescription = ObjectType<typeof serializedAgentDescription>;
