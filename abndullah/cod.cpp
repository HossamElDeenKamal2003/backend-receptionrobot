#include <bits/stdc++.h>
using namespace std;

class Solver {
private:
    int n;
    vector<int> pref;

public:
    Solver(int size) {
        n = size;
        pref.assign(n + 1, 0);
    }

    int query(int l, int r) {
        cout << "? " << l << " " << r << endl;
        cout.flush();

        int res;
        cin >> res;
        if (res == -1) exit(0);

        return res;
    }

    void solve() {
        for (int i = 1; i <= n; i++) {
            int f = query(1, i);
            pref[i] = f - 1; 
        }
        string s(n, '0');

        for (int i = 1; i <= n; i++) {
            int bit = pref[i] - pref[i - 1];
            s[i - 1] = (bit == 1 ? '1' : '0');
        }

        cout << "! " << s << endl;
        cout.flush();
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;

    while (t--) {
        int n;
        cin >> n;

        Solver solver(n);
        solver.solve();
    }

    return 0;
}
