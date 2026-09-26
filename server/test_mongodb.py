from database.mongodb import test_connection



def main():

    try:

        test_connection()

        print()
        print("================================")
        print(" MongoDB connection successful! ")
        print("================================")
        print()

    except Exception as error:

        print()
        print("================================")
        print(" MongoDB connection FAILED! ")
        print("================================")
        print()
        print(error)


if __name__ == "__main__":
    main()