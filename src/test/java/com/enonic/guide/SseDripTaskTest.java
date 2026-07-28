package com.enonic.guide;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class SseDripTaskTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/tasks/sse-drip/sse-drip-test.js";
    }
}
