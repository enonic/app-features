package com.enonic.guide;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class ClockServiceTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/services/clock/clock-test.js";
    }
}
