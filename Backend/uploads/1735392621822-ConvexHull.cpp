#include <iostream>
#include <algorithm>
#include <vector>

using namespace std;

struct Point
{
    int x, y;

    Point() {}

    Point(int _x, int _y) : x(_x), y(_y) {}

    bool operator < (const Point& other)
    {
        return (x < other.x) || (x == other.x && y < other.y);
    }
};

struct Vector
{
    int x, y;

    Vector() {}

    Vector(int _x, int _y) : x(_x), y(_y) {}

    double cross_product(const Vector& other)
    {
        return x * other.y - y * other.x;
    }
};

Vector operator - (const Point& a, const Point& b)
{
    return Vector(a.x - b.x, a.y - b.y);
}

int orientation(const Point& a, const Point& b, const Point& c)
{
    Vector x = b - a;
    Vector y = c - b;
    int orient = x.cross_product(y);

    if (orient < 0) // Cùng chiều kim đồng hồ.
        return -1;
    else if (orient == 0) // Thẳng hàng.
        return 0;
    return 1; // Ngược chiều kim đồng hồ.
}

bool ccw(const Point& a, const Point& b, const Point& c, bool include_collinear = true) // Counterclockwise
{
    int orient = orientation(a, b, c);
    return (orient > 0) || (orient == 0 && include_collinear);
}

bool cw(const Point& a, const Point& b, const Point& c, bool include_collinear = true) // Clockwise
{
    int orient = orientation(a, b, c);
    return (orient < 0) || (orient == 0 && include_collinear);
}

vector < Point > convex_hull(int n, vector < Point >& p, bool include_collinear = true)
{
    sort(p.begin(), p.end());

    Point first = p[0], last = p[n];
    vector < Point > up(1, first);
    vector < Point > down(1, first);
    for (int i = 1; i < n; ++i)
    {
        if (i == n || cw(first, p[i], last, include_collinear))
        {
            while (up.size() >= 2 && !cw(up[up.size() - 2], up.back(), p[i], include_collinear))
                up.pop_back();
            up.push_back(p[i]);
        }

        if (i == n || ccw(first, p[i], last, include_collinear))
        {
            while (down.size() >= 2 && !ccw(down[down.size() - 2], down.back(), p[i], include_collinear))
                down.pop_back();
            down.push_back(p[i]);
        }
    }

    vector < Point > hull;
    for (int i = 0; i < up.size(); ++i)
        hull.push_back(up[i]);
    for (int i = down.size() - 1; i >= 1; --i)
        hull.push_back(down[i]);

    return hull;
}

double polygonArea(const vector<Point>& hull) {
    double area = 0;
    int n = hull.size();
    
    for (int i = 0; i < n; ++i) {
        int j = (i + 1) % n; // Next vertex (wraps around to the first vertex)
        area += hull[i].x * hull[j].y;
        area -= hull[j].x * hull[i].y;
    }
    
    area = abs(area) / 2.0;
    return area;
}

int main()
{
    vector < Point > p = {{0, 0}, {4, 0}, {4, 3}, {0, 3}, {2, 1}, {1, 1}, {3, 1}};

    cout << "Convex hull:\n";
    vector < Point > hull = convex_hull(p.size(), p);
    for (auto p : hull)
        cout << p.x << ", " << p.y << endl;
    cout << "Hull area: " << polygonArea(hull) << endl;

    return 0;
}
