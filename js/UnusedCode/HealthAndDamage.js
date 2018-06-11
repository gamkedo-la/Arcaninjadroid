//base class for HP and DMG
function HitPointsAndDamageClass(characterType, LVL)
{
	/* these three lines will enable any character to sustain five hits before dying. 
		will hopefully feature:
		base HP, DEF, and DMG off the characters LVL.
		the DMG multiplier will also change DMG based on the length the player's combo
	*/
	this.baseHP = 300.0;
	this.baseDEF = 20.0;
	this.baseDMG = 30.0;
	this.baseDmgMultiplier = 1.0;

	this.newHP;
	this.newDEF;
	this.newDMG;

	this.oldHP;
	this.newDEF;
	this.newDMG;

	this.charType = characterType;
	this.lvl = LVL;

	this.setHP = function()
	{
		switch(this.charType)
		{
			case "player":
				break;
		}

		switch(this.lvl)
		{
			case 1:
				break;
		}
	}

	this.getHP = function()
	{

	}

	this.setDEF = function()
	{
		switch(this.charType)
		{
			case "player":
				break;
		}

		switch(this.LVL)
		{
			case 1:
				break;
		}
	}

	this.getDEF = function()
	{
		
	}

	this.setDMG = function()
	{
		switch(this.charType)
		{
			case "player":
				break;
		}

		switch(this.LVL)
		{
			case 1:
				break;
		}
	}

	this.getDMG = function()
	{
		
	}
}