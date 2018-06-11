//base class for HP and DMG
function HPandDMGclass(LVL, HpMultiplier, DefMultiplier, DmgMultiplier)
{
	/* the first chunk of lines are base stats for any character but they will be modified depending on the character's lvl and 
		the passed in decimal values for multiplier.
		will hopefully feature:
		base HP, DEF, and DMG off the characters LVL.
		the DMG multiplier will also change DMG based on the length the player's combo
	*/
	this.baseHP = 300.0;
	this.hpMultiplier = HpMultiplier;
	this.baseDEF = 20.0;
	this.defMultiplier = DefMultiplier;
	this.baseDMG = 30.0;
	this.dmgMultiplier = DmgMultiplier;

	this.modifiedHP;
	this.modifiedDEF; 
	this.modifiedDMG; 

	this.newHP;
	this.isCharacterDead = false;

	this.lvl = LVL;

	//call this when the character is hit to update HP
	this.characterHasBeenHitSoCalculateNewHP = function()
	{
		this.newHP = this.modifiedHP 
	}

	this.calculateModifiedStat = function(stat, multiplier)
	{
		return (this.lvl * stat * multiplier);
	}

	//this should get called constantly to check if the player is in a combo or not and reflect the appropriate DMG values
	this.setComboMultiplier = function(currentCombo)
	{
		//increases by 1/20th of the current combo value and adds it to the DMG multiplier
		var comboIncrementer = currentCombo * 0.05;
		if(currentCombo > 1)
		{
			this.dmgMultiplier += comboIncrementer;
		}
	}

	this.getNewHP = function()
	{
		return this.newHP;
	}

	this.hasModifiedHPBeenSet = false;
	this.setModifiedHP = function()
	{
		if(!this.hasModifiedHPBeenSet)
		{
			this.modifiedHP = calculateModifiedStat(this.baseHP, this.hpMultiplier);
			this.hasModifiedHPBeenSet = true;
		}
	}

	//this is mainly for the player to allow them to increase their HP but it could apply to enemies if we want leveled enemies
	this.characterGainedOrLossLvl = function()
	{
		this.hasModifiedHPBeenSet = false;
	}

	this.getModifiedHP = function()
	{
		return this.modifiedHP;
	}

	this.setDef = function()
	{
		calculateModifiedStat(this.baseDEF, this.defMultiplier);
	}

	this.getDEF = function()
	{
		return this.modifiedDEF;
	}

	this.setDMG = function()
	{
		calculateModifiedStat(this.baseDMG, this.dmgMultiplier);
	}

	this.getDMG = function()
	{
		return this.modifiedDMG;
	}
}