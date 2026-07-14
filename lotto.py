#!/usr/bin/env python3
import argparse
import random


def generate_lotto_numbers():
    """Generate a sorted set of 6 distinct lotto numbers."""
    numbers = random.sample(range(1, 46), 6)
    return sorted(numbers)


def main():
    parser = argparse.ArgumentParser(
        description="로또 번호를 자동으로 생성하는 간단한 로또 추첨기입니다."
    )
    parser.add_argument(
        "-n",
        "--tickets",
        type=int,
        default=1,
        help="생성할 로또 번호 세트 수 (기본값: 1)",
    )
    args = parser.parse_args()

    tickets = max(1, min(10, args.tickets))

    print("=== 로또 추첨기 ===")
    print(f"생성할 티켓 수: {tickets}\n")

    for idx in range(1, tickets + 1):
        numbers = generate_lotto_numbers()
        formatted = " ".join(f"{num:02d}" for num in numbers)
        print(f"티켓 {idx}: {formatted}")

    print("\n행운을 빕니다!")


if __name__ == "__main__":
    main()
