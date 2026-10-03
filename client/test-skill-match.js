import { calculateSkillMatch, normalizeSkill } from './src/utils/skillMatch.js';

function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            passed++;
            console.log(`✓ PASS: ${message}`);
        } else {
            failed++;
            console.error(`✗ FAIL: ${message}`);
        }
    }

    console.log('--- Running Skill Match Unit Tests ---');

    // 1. Empty skills handling
    const t1 = calculateSkillMatch([], []);
    assert(t1.percent === 0 && t1.matched.length === 0, 'Empty lists return 0%');

    const t2 = calculateSkillMatch(['React', 'Node'], []);
    assert(t2.percent === 0 && t2.matched.length === 0, 'Job without skills returns 0%');

    // 2. Exact match
    const t3 = calculateSkillMatch(['React', 'Node.js', 'PostgreSQL'], ['React', 'Node.js']);
    assert(t3.percent === 100 && t3.matched.length === 2 && t3.missing.length === 0, 'Exact match returns 100%');

    // 3. Aliases and casing
    const t4 = calculateSkillMatch(['reactjs', 'TS', 'NODE'], ['React', 'TypeScript', 'Node.js']);
    assert(t4.percent === 100 && t4.matched.length === 3, 'Aliases (reactjs->react, TS->typescript, NODE->node.js) match 100%');

    // 4. Partial match
    const t5 = calculateSkillMatch(['Python', 'Docker'], ['Python', 'Docker', 'Kubernetes', 'AWS']);
    assert(t5.percent === 50 && t5.matched.length === 2 && t5.missing.length === 2, 'Partial match calculates 50% correctly');

    // 5. Duplicate skills in input
    const t6 = calculateSkillMatch(['React', 'react', 'REACTJS'], ['react', 'React']);
    assert(t6.percent === 100 && t6.matched.length === 1, 'Duplicate skills deduplicated gracefully');

    console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
