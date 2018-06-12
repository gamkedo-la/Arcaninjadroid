//base class for XP
function XPclass()
{
	/*all characters will start off at lvl 1.
		will hopefully feature the following: 
	 	gaining XP depending on either the type of enemy defeated or that enemy lvl or both.
		higher lvl enemies provide more xp while lower lvl enemies provide minimal xp
		or this could also go based off of the player's combo
		or both
	*/
	this.currentLVL = 1;
	this.nextLVL = this.lvl + 1;

	this.comboMultiplier = 1.0;
	this.multiplier = 1.0;

	this.xpDrop;

	this.currentXP = this.calculateCurrentXP(this.currentLVL, this.multiplier);
	this.xpForNextLVL = this.calculateNextXP(this.nextLVL, this.multiplier);
	this.diff = this.xpForNextLVL - this.currentXP;

	this.getCurrentLVL = function()
	{
		return this.currentLVL;
	}

	this.setLVL = function()
	{
		if(this.diff == 0)
		{
			this.currentLVL = this.nextLVL;
		}
	}

	this.calculateXPdrop = function(LVL, )
	{
		switch(LVL)
		{
			case 1:
				break;
		}
	}

	this.getXPdrop = function()
	{
		calculateXPdrop();
		return this.xpDrop;
	}

	this.getCurrentXP = function()
	{
		return this.currentXP;
	}

	this.getXPtoNextLevel = function()
	{
		return this.xpForNextLVL;
	}

	this.calculateCurrentXP = function(lvl, multiplier)
	{
		if(lvl == 1)
		{
			return 0;
		}
		else
		{
			return (lvl * (lvl + 1)) * multiplier;
		}	
	}

	this.calculateNextXP = function(lvl, multiplier)
	{
		return (lvl * (lvl + 1)) * multiplier;
	}

	this.setComboMultiplier = function(currentCombo)
	{

	}

	this.setXPmultiplier = function()
	{

	}
}