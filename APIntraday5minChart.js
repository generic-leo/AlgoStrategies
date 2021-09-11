//@version=4
strategy("AP Intraday @5m Chart ", overlay=true, initial_capital=1000)

_h = hour(time)
_m = minute(time)

// Target Multiplier 
targetMultiplier    = input(title="Target Multiply", type=input.integer, defval=1, minval=0, maxval=5)

// Start 
start_hour_bar      = input(title="Range1 Hour", type=input.integer, defval=09, minval=0, maxval=60)
start_minute_bar    = input(title="Range1 Minute", type=input.integer, defval=15, minval=0, maxval=60)

// End 
end_hour_bar        = input(title="Range2 Hour", type=input.integer, defval=09, minval=0, maxval=60)
end_minute_bar      = input(title="Range2 Minute", type=input.integer, defval=25, minval=0, maxval=60)

// Exit 
exit_hour_bar        = input(title="Exit Hour", type=input.integer, defval=14, minval=0, maxval=60)
exit_minute_bar      = input(title="Exit Minute", type=input.integer, defval=30, minval=0, maxval=60)

startCandle     = (_h == start_hour_bar) and (_m == start_minute_bar)
endCandle       = (_h == end_hour_bar) and (_m == end_minute_bar)
exitCandle      = (_h == exit_hour_bar) and (_m == exit_minute_bar)

currentAtr      = atr(10) == na ? 0 : atr(10)

var float upperRange        = 0
var float lowerRange        = 0
var float atrPrice          = 0
var float targetBuyPrice    = 0
var float targetSellPrice   = 0
var float stopLoss          = 0

// Reset 
if startCandle
    upperRange          := 0
    lowerRange          := 0
    atrPrice            := 0
    targetBuyPrice      := 0
    targetSellPrice     := 0
    stopLoss            := 0
    strategy.cancel_all() // closes any pending orders

// Assign
if endCandle
    upperRange      := max(high[2], high[1], high[0])
    lowerRange      := min(low[2], low[1], low[0])
    atrPrice        := currentAtr
    targetBuyPrice  := upperRange + atrPrice
    targetSellPrice := targetBuyPrice + atrPrice + atrPrice
    stopLoss        := lowerRange // upperRange - atrPrice
    tip = "Buy@" + tostring(targetBuyPrice, '#.##') + " Sell@" + tostring(targetSellPrice, '#.##') + " SL@" + tostring(stopLoss, '#.##')
    label.new(bar_index + 1, upperRange + atrPrice, tip)
    
showRange = false 

if (_h == end_hour_bar and _m >= end_minute_bar)
    showRange := true
else if (_h >= end_hour_bar and _h < exit_hour_bar)    
    showRange := true 
else if (_h == exit_hour_bar and _m <= exit_minute_bar)
    showRange := true 
else
    showRange := false 
    
showUpper()     => showRange and upperRange > 0
showLower()     => showRange and lowerRange > 0
tradeWindow()   => showUpper() and showLower()

bgcolor(color=showUpper() ? na : color.blue)

p1 = plot(showUpper() ? upperRange: high, linewidth=1, color=showUpper() ? color.red : color.white)
p2 = plot(showLower() ? lowerRange: close, linewidth=1, color=showLower() ? color.red : color.white)

fill(p1, p2, color=color.green)

// ==========================================================================================================
// STRATEGY
// ==========================================================================================================
strategy.risk.max_intraday_filled_orders(count=2)

// Entry & Exit 
if(tradeWindow() and atrPrice > 0)
    strategy.entry("Long", strategy.long, stop = targetBuyPrice, qty=100, when=strategy.position_size == 0)
    strategy.exit("Long", from_entry="Long", limit=targetSellPrice, stop=stopLoss, when=strategy.position_size > 0)    
else
    // Reset all 
    upperRange          := 0
    lowerRange          := 0
    atrPrice            := 0
    targetBuyPrice      := 0
    targetSellPrice     := 0
    stopLoss            := 0
    // Force close all positions 
    strategy.close_all()
      
if exitCandle and strategy.position_size > 0
    label.new(bar_index, high, "Auto-Closing Position")
    // strategy.close("Long")

// Logging
plotchar(tradeWindow(),"In Trading Window", "", location = location.top)
plotchar(strategy.position_size,"Open Positions", "", location = location.top)
plotchar(atrPrice, "ATR", "", location = location.top)    
plotchar(currentAtr, "ATR1", "", location = location.top)    
plotchar(stopLoss, "StopLoss", "", location = location.top)
plotchar(targetBuyPrice, "Target BP", "", location = location.top)
plotchar(targetSellPrice,"Target SP", "", location = location.top)

    
    
