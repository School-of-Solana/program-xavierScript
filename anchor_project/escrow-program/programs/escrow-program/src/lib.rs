use anchor_lang::prelude::*;

declare_id!("Dyp4fYZC13qTa4TNTuoGqHKsyLZKBoB1iivDNSTdQ5rg");

pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

#[program]
pub mod escrow_program {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64, receive: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit()?;
        ctx.accounts.withdraw_and_close_vault()
    }
}