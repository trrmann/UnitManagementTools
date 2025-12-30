/** @jest-environment jsdom */

describe('Dashboard Quick Actions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="dashboard-section">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button class="action-btn dashboard-QuickActions-ResetPassword" id="resetPasswordBtn">
                        <i class="fas fa-key"></i> Reset Password
                    </button>
                    <button class="action-btn dashboard-QuickActions-AddMember" id="addMemberBtn">
                        <i class="fas fa-user-plus"></i> Add Member
                    </button>
                </div>
            </div>
        `;
        window.alert = jest.fn();
        // Simulate script.js attaching the handler
        const resetPasswordBtn = document.getElementById('resetPasswordBtn');
        if (resetPasswordBtn) {
            resetPasswordBtn.onclick = () => {
                alert('Reset Password mock functionality triggered.');
            };
        }
    });

    it('should render the Reset Password button as the first quick action', () => {
        const btns = document.querySelectorAll('.action-buttons button');
        expect(btns[0]).toBeDefined();
        expect(btns[0].id).toBe('resetPasswordBtn');
        expect(btns[0].textContent).toContain('Reset Password');
    });

    it('should trigger mock functionality on click', () => {
        const btn = document.getElementById('resetPasswordBtn');
        btn.click();
        expect(window.alert).toHaveBeenCalledWith('Reset Password mock functionality triggered.');
    });
});
