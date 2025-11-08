use anchor_lang::prelude::*;

declare_id!("Dyp4fYZC13qTa4TNTuoGqHKsyLZKBoB1iivDNSTdQ5rg");

#[program]
pub mod escrow_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
